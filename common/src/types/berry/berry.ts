export interface Berry {
  name: string;
  value: number;
  type: string;
}
export interface BerrySet {
  amount: number;
  berry: Berry;
  level: number;
  /** Berry-zone strength bonus in percentage points. Simulation sets retain the bonus at production. */
  berryZoneBonus?: number;
}
// TODO: Synchronize BerrySetSimple with BerrySet, including berryZoneBonus for stockpiled berries.
export interface BerrySetSimple {
  amount: number;
  name: string;
  level: number;
}
export type BerryIndexToIntAmount = Int16Array;
export type BerryIndexToFloatAmount = Float32Array;
