import { command } from './recipe';
import { getRecipe, Recipe } from '@common/domain'; // Import Recipe type for mock
import { EmbedBuilder } from 'discord.js';

// Mock @common/domain
jest.mock('@common/domain', () => ({
  getRecipe: jest.fn(),
}));

// We will use the actual EmbedBuilder and inspect its data for assertions.

describe('/recipe command', () => {
  const mockInteraction: any = {
    options: {
      getString: jest.fn(),
    },
    reply: jest.fn(),
    followUp: jest.fn(),
    replied: false,
    deferred: false,
  };

  // Cast getRecipe to jest.Mock for type safety in tests
  const mockGetRecipe = getRecipe as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockInteraction.options.getString.mockReset();
    mockInteraction.reply.mockReset();
    mockInteraction.followUp.mockReset();
    mockInteraction.replied = false;
    mockInteraction.deferred = false;
  });

  it('should have the correct command data', () => {
    expect(command.data.name).toBe('recipe');
    const option = command.data.options.find(opt => opt.toJSON().name === 'recipename');
    expect(option).toBeDefined();
    if (option) { // TypeScript type guard
      const optionJSON = option.toJSON();
      expect(optionJSON.description).toBe('The name of the recipe');
      expect(optionJSON.required).toBe(true);
    }
  });

  it('should fetch and display a recipe successfully', async () => {
    const recipeName = 'Test Recipe';
    const mockRecipeData: Recipe = { // Use the Recipe type for the mock
      name: recipeName,
      displayName: 'Delicious Test Recipe',
      ingredients: [{ name: 'Ing1', quantity: 2 }, { name: 'Ing2', quantity: 1 }],
      value: 100,
      valueMax: 200, // Added as per Recipe interface
      type: 'curry',
      bonus: 10,
      nrOfIngredients: 2, // This is used as 'Servings' in the command
    };
    mockGetRecipe.mockReturnValue(mockRecipeData);
    mockInteraction.options.getString.mockReturnValue(recipeName);

    await command.execute(mockInteraction);

    expect(getRecipe).toHaveBeenCalledWith(recipeName);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(expect.objectContaining({
      embeds: expect.arrayContaining([
        expect.any(EmbedBuilder)
      ])
    }));
    
    const repliedEmbed = (mockInteraction.reply.mock.calls[0][0] as any).embeds[0] as EmbedBuilder;
    expect(repliedEmbed.data.title).toBe(mockRecipeData.displayName);
    expect(repliedEmbed.data.fields).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ name: 'Type', value: 'curry', inline: true }),
            expect.objectContaining({ name: 'Servings', value: mockRecipeData.nrOfIngredients.toString(), inline: true }),
            expect.objectContaining({ name: 'Value', value: mockRecipeData.value.toString(), inline: true }),
            expect.objectContaining({ name: 'Bonus', value: mockRecipeData.bonus.toString(), inline: true }),
            expect.objectContaining({ name: 'Ingredients', value: 'Ing1 (x2)\nIng2 (x1)' }),
        ])
    );
  });

  it('should handle recipe not found error and reply', async () => {
    const recipeName = 'Unknown Recipe';
    mockGetRecipe.mockImplementation(() => {
      throw new Error(`Could not find recipe: ${recipeName}`); // Error message doesn't have to match exactly
    });
    mockInteraction.options.getString.mockReturnValue(recipeName);

    await command.execute(mockInteraction);

    expect(getRecipe).toHaveBeenCalledWith(recipeName);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true,
    });
    expect(mockInteraction.followUp).not.toHaveBeenCalled();
  });
  
  it('should handle recipe not found error with followUp if already replied', async () => {
    const recipeName = 'Unknown Recipe Followup';
    mockGetRecipe.mockImplementation(() => {
      throw new Error(`Could not find recipe: ${recipeName}`); // Error message doesn't have to match exactly
    });
    mockInteraction.options.getString.mockReturnValue(recipeName);
    mockInteraction.replied = true; // Simulate already replied

    await command.execute(mockInteraction);

    expect(getRecipe).toHaveBeenCalledWith(recipeName);
    expect(mockInteraction.followUp).toHaveBeenCalledTimes(1);
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true,
    });
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it('should handle recipe not found error with followUp if deferred', async () => {
    const recipeName = 'Unknown Recipe Deferred';
    mockGetRecipe.mockImplementation(() => {
      throw new Error(`Could not find recipe: ${recipeName}`);
    });
    mockInteraction.options.getString.mockReturnValue(recipeName);
    mockInteraction.deferred = true; // Simulate deferred

    await command.execute(mockInteraction);

    expect(getRecipe).toHaveBeenCalledWith(recipeName);
    expect(mockInteraction.followUp).toHaveBeenCalledTimes(1);
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true,
    });
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it('should handle error during interaction.reply', async () => {
    const recipeName = 'Reply Error Recipe';
    const mockRecipeData: Recipe = {
      name: recipeName,
      displayName: 'Reply Error Test Recipe',
      ingredients: [], value: 50, valueMax: 50, type: 'salad', bonus: 5, nrOfIngredients: 1,
    };
    mockGetRecipe.mockReturnValue(mockRecipeData);
    mockInteraction.options.getString.mockReturnValue(recipeName);
    // Simulate error during the initial reply
    mockInteraction.reply.mockRejectedValue(new Error("Discord API error")); 

    // We expect the error to be caught and logged by the command's error handler
    // The test focuses on ensuring getRecipe was called, and reply was attempted.
    // The command itself logs the error, and doesn't throw it further.
    await command.execute(mockInteraction);

    expect(getRecipe).toHaveBeenCalledWith(recipeName);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    // No followUp because the initial reply attempt failed and was not "successful" (replied/deferred states not set by mock)
    expect(mockInteraction.followUp).not.toHaveBeenCalled(); 
  });
});
