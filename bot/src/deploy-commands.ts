/* eslint-disable SleepAPILogger/no-console */
import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { config } from './config';

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}
