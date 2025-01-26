export type Energy = 'energy';
export type Berries = 'berries';
export type Ingredients = 'ingredients';
export type Helps = 'helps';
export type DreamShards = 'dream shards';
export type Strength = 'strength';
export type PotSize = 'pot size';
export type TastyChance = 'chance';
export type Metronome = 'metronome';
export type Copy = 'copy';

export const mainskillUnits = [
  'energy',
  'berries',
  'ingredients',
  'helps',
  'dream shards',
  'strength',
  'pot size',
  'chance',
  'metronome',
  'copy'
] as const;

export type MainskillUnit = (typeof mainskillUnits)[number];
