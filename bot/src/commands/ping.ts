import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply('Pong!');
}

export const command = { data, execute };
