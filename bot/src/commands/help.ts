import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder().setName('help').setDescription('Shows information about the SleepAPI bot');

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('SleepAPI Bot Help')
    .setDescription('This bot provides utilities for the SleepAPI community.')
    .setColor(0x0099ff)
    .addFields(
      { name: '/ping', value: 'Check if the bot is online' },
      { name: '/help', value: 'Show this help message' },
      { name: '/recipe', value: 'Get information about a recipe' }
    )
    .setFooter({ text: 'SleepAPI Bot • Version 1.0.0' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

export const command = { data, execute };
