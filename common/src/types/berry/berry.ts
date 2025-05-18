export interface Berry {
  name: string;
  value: number;
  type: string;
}
export interface BerrySet {
  amount: number;
  berry: Berry;
  level: number;
}
export interface BerrySetSimple {
  amount: number;
  name: string;
  level: number;
}
export type BerryIndexToIntAmount = Int16Array;
export type BerryIndexToFloatAmount = Float32Array;
