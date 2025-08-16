import type { Modifier } from '../modifier';

export interface Event {
  name: string;
  description: string;
  modifiers: Modifier[];

  // Scheduling
  startDate?: Date;
  endDate?: Date;

  // Metadata
  createdBy?: string; // User ID who created it
  createdAt?: Date;
  updatedAt?: Date;
}
