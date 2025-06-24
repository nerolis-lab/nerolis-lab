import type { IngredientSet, Recipe } from 'common';
import { getRecipe, RECIPES } from 'common';
import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts a recipe name to its corresponding image filename
 * Example: 'MIXED_JUICE' -> 'mixedjuice.png'
 */
function getRecipeImageFilename(recipeName: string): string {
  return recipeName.toLowerCase().replace(/_/g, '') + '.png';
}

/**
 * Gets the local file path for a recipe image
 */
function getRecipeImagePath(recipeName: string): string {
  const filename = getRecipeImageFilename(recipeName);
  // Path should point to dist/recipe since that's where vite copies the public assets
  return path.join(__dirname, 'recipe', filename);
}

export const command = {
  data: new SlashCommandBuilder()
    .setName('recipe')
    .setDescription('Fetches and displays a recipe.')
    .addStringOption((option) =>
      option.setName('recipename').setDescription('The name of the recipe').setRequired(true).setAutocomplete(true)
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();

    // Filter recipes based on user input
    const filtered = RECIPES.filter(
      (recipe: Recipe) =>
        recipe.displayName.toLowerCase().includes(focusedValue.toLowerCase()) ||
        recipe.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    // Discord autocomplete can show max 25 options
    const options = filtered.slice(0, 25).map((recipe: Recipe) => ({
      name: recipe.displayName,
      value: recipe.name
    }));

    await interaction.respond(options);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const recipeName = interaction.options.getString('recipename');

    try {
      const recipe: Recipe = getRecipe(recipeName!);

      const ingredientsList = recipe.ingredients
        .map((ing: IngredientSet) => `${ing.ingredient.name} (x${ing.amount})`)
        .join('\n');

      // Create file attachment for the recipe image
      const imagePath = getRecipeImagePath(recipe.name);
      const imageFilename = getRecipeImageFilename(recipe.name);

      let attachment;
      if (fs.existsSync(imagePath)) {
        attachment = new AttachmentBuilder(imagePath, { name: imageFilename });
        logger.log(`Found image for ${recipe.name}: ${imagePath}`);
      } else {
        logger.log(`Image not found for ${recipe.name}: ${imagePath}`);
      }

      const recipeEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(recipe.displayName)
        .addFields(
          { name: 'Type', value: recipe.type, inline: true },
          { name: 'Servings', value: recipe.nrOfIngredients.toString(), inline: true },
          { name: 'Value', value: recipe.value.toString(), inline: true },
          { name: 'Bonus', value: recipe.bonus.toString(), inline: true },
          { name: 'Ingredients', value: ingredientsList || 'No ingredients listed' }
        )
        .setTimestamp()
        .setFooter({ text: "Neroli's Lab Bot" });

      // If we have an image, set it and include it as attachment
      if (attachment) {
        recipeEmbed.setImage(`attachment://${imageFilename}`);
        await interaction.reply({ embeds: [recipeEmbed], files: [attachment] });
      } else {
        await interaction.reply({ embeds: [recipeEmbed] });
      }
    } catch (error) {
      // eslint-disable-next-line SleepAPILogger/no-console
      console.error('Recipe command error:', error as Error);
      // Try to reply to the interaction if it hasn't been replied to yet
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `Could not find recipe: ${recipeName}`, ephemeral: true });
      } else {
        // If already replied or deferred, try to follow up
        await interaction.followUp({ content: `Could not find recipe: ${recipeName}`, ephemeral: true });
      }
    }
  }
};
