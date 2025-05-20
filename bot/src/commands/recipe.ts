import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRecipe, Recipe } from '@common/domain'; // Ensure this path is correct for your project structure

export const command = {
  data: new SlashCommandBuilder()
    .setName('recipe')
    .setDescription('Fetches and displays a recipe.')
    .addStringOption(option =>
      option.setName('recipename')
        .setDescription('The name of the recipe')
        .setRequired(true)),
  async execute(interaction: any) { // Replace 'any' with the correct Interaction type if known
    const recipeName = interaction.options.getString('recipename');

    try {
      const recipe: Recipe = getRecipe(recipeName);

      const ingredientsList = recipe.ingredients.map(ing => `${ing.name} (x${ing.quantity})`).join('\n');

      const recipeEmbed = new EmbedBuilder()
        .setColor(0x0099FF) // You can choose any color
        .setTitle(recipe.displayName)
        .addFields(
          { name: 'Type', value: recipe.type, inline: true },
          { name: 'Servings', value: recipe.nrOfIngredients.toString(), inline: true }, // Assuming nrOfIngredients means servings
          { name: 'Value', value: recipe.value.toString(), inline: true },
          { name: 'Bonus', value: recipe.bonus.toString(), inline: true },
          { name: 'Ingredients', value: ingredientsList || 'No ingredients listed' }
        )
        // .setImage(recipe.image || 'default_image_url_here') // Uncomment and set a default if you have images
        .setTimestamp()
        .setFooter({ text: 'Neroli\'s Lab Bot' });

      await interaction.reply({ embeds: [recipeEmbed] });
    } catch (error) {
      console.error(error);
      // Try to reply to the interaction if it hasn't been replied to yet
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `Could not find recipe: ${recipeName}`, ephemeral: true });
      } else {
        // If already replied or deferred, try to follow up
        await interaction.followUp({ content: `Could not find recipe: ${recipeName}`, ephemeral: true });
      }
    }
  },
};
