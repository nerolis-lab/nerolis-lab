import type { Modifier } from '../modifier/modifier';
import type { ModifierTargetType } from '../modifier/target-types';

export interface Event {
  name: string;
  description: string;
  modifiers: Modifier<ModifierTargetType>[];

  // Scheduling
  startDate?: Date;
  endDate?: Date;
}
