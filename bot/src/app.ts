/* eslint-disable SleepAPILogger/no-console */
import { Client, Events, GatewayIntentBits } from 'discord.js';
import type { Application, Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';
import { commands } from './commands';
import { config } from './config';
import { deployCommands } from './deploy-commands';

// API
const app: Application = express();
const port = config.PORT ?? 3000;
app.use(express.json());
app.use(morgan('tiny'));
app.get('/', (req: Request, res: Response) => {
  try {
    res.send('Sleep API Bot is a Discord bot for Sleep API');
  } catch (err) {
    console.error(err as Error);
    res.status(500).send('Something went wrong');
  }
});
app.get('/health', (req: Request, res: Response) => {
  try {
    res.header('Content-Type', 'application/json').send(JSON.stringify({ status: 'healthy' }, null, 4));
  } catch (err) {
    console.error(err as Error);
    res.status(500).send('Something went wrong');
  }
});
console.info('⚡️[info]: starting API');
app.listen(port, async () => {
  console.log(`API is running at ${port}`);
});

// DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// At startup register commands
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Discord bot is ready! 🤖 Logged in as ${readyClient.user.tag}`);
  await deployCommands();
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const command = commands[commandName as keyof typeof commands];

  if (!command) {
    console.error(`No command matching ${commandName} was found.`);
    try {
      await interaction.reply({ content: `Command not found: ${commandName}`, ephemeral: true });
    } catch (replyError) {
      console.error('Error trying to reply about unknown command:', replyError);
    }
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);

      // Reply with error if the interaction hasn't been replied to yet
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
      }
    }
  }
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});
