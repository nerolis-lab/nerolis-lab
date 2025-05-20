import { command as helpCommand } from './help';
import { command as pingCommand } from './ping';
import { command as recipeCommand } from './recipe';

export const commands = {
  ping: pingCommand,
  help: helpCommand,
  recipe: recipeCommand,
};
