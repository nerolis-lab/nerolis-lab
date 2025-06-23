export const mainskillUnits = [
  'energy',
  'berries',
  'ingredients',
  'helps',
  'dream shards',
  'strength',
  'pot size',
  'crit chance'
] as const;

export type MainskillUnit = (typeof mainskillUnits)[number];
