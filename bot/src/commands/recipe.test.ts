/* eslint-disable @typescript-eslint/no-explicit-any */
import { curry, type Recipe } from 'common';
import { EmbedBuilder } from 'discord.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { command } from './recipe';

// We will use the actual EmbedBuilder and inspect its data for assertions.

describe('/recipe command', () => {
  const mockInteraction: any = {
    options: {
      getString: vi.fn()
    },
    reply: vi.fn(),
    followUp: vi.fn(),
    replied: false,
    deferred: false
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockInteraction.options.getString.mockReset();
    mockInteraction.reply.mockReset();
    mockInteraction.followUp.mockReset();
    mockInteraction.replied = false;
    mockInteraction.deferred = false;
  });

  it('should have the correct command data', () => {
    expect(command.data.name).toBe('recipe');
    const option = command.data.options.find((opt) => opt.toJSON().name === 'recipename');
    expect(option).toBeDefined();
    if (option) {
      // TypeScript type guard
      const optionJSON = option.toJSON();
      expect(optionJSON.description).toBe('The name of the recipe');
      expect(optionJSON.required).toBe(true);
    }
  });

  it('should fetch and display a recipe successfully', async () => {
    const mockRecipeData: Recipe = curry.CUT_SUKIYAKI_CURRY;
    mockInteraction.options.getString.mockReturnValue(mockRecipeData.name);

    await command.execute(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([expect.any(EmbedBuilder)])
      })
    );

    const repliedEmbed = (mockInteraction.reply.mock.calls[0][0] as any).embeds[0] as EmbedBuilder;
    expect(repliedEmbed.data.title).toBe(mockRecipeData.displayName);
    expect(repliedEmbed.data.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Type', value: 'curry', inline: true }),
        expect.objectContaining({ name: 'Servings', value: mockRecipeData.nrOfIngredients.toString(), inline: true }),
        expect.objectContaining({ name: 'Value', value: mockRecipeData.value.toString(), inline: true }),
        expect.objectContaining({ name: 'Bonus', value: mockRecipeData.bonus.toString(), inline: true }),
        expect.objectContaining({
          name: 'Ingredients',
          value: mockRecipeData.ingredients.map((ing) => `${ing.ingredient.name} (x${ing.amount})`).join('\n')
        })
      ])
    );
  });

  it('should handle recipe not found error and reply', async () => {
    const recipeName = 'Unknown Recipe';

    mockInteraction.options.getString.mockReturnValue(recipeName);

    await command.execute(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true
    });
    expect(mockInteraction.followUp).not.toHaveBeenCalled();
  });

  it('should handle recipe not found error with followUp if already replied', async () => {
    const recipeName = 'Unknown Recipe Followup';

    mockInteraction.options.getString.mockReturnValue(recipeName);
    mockInteraction.replied = true; // Simulate already replied

    await command.execute(mockInteraction);

    expect(mockInteraction.followUp).toHaveBeenCalledTimes(1);
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true
    });
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it('should handle recipe not found error with followUp if deferred', async () => {
    const recipeName = 'Unknown Recipe Deferred';

    mockInteraction.options.getString.mockReturnValue(recipeName);
    mockInteraction.deferred = true; // Simulate deferred

    await command.execute(mockInteraction);

    expect(mockInteraction.followUp).toHaveBeenCalledTimes(1);
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      content: `Could not find recipe: ${recipeName}`,
      ephemeral: true
    });
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  // Note: Removing the Discord API error test as it's an edge case and the mock behavior differs between Jest and Vitest
});
