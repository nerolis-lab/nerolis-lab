import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { config } from './config';

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

export async function deployCommands(guildId?: string) {
  try {
    console.log('Started refreshing application (/) commands.');

    // Use guild commands for development (instant updates) or global for production
    const route = guildId
      ? Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId)
      : Routes.applicationCommands(config.DISCORD_CLIENT_ID);

    await rest.put(route, {
      body: commandsData
    });

    console.log(`Successfully reloaded application (/) commands ${guildId ? 'for guild ' + guildId : 'globally'}.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}
