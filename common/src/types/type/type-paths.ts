type PathsOfObject<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Array<infer U>
    ? U extends object
      ?
          | `${Prefix}${K}`
          | `${Prefix}${K}.${number}`
          | `${Prefix}${K}.*`
          | PathsOfObject<U, `${Prefix}${K}.${number}.`>
          | PathsOfObject<U, `${Prefix}${K}.*.`>
      : `${Prefix}${K}` | `${Prefix}${K}.${number}` | `${Prefix}${K}.*`
    : T[K] extends object
      ? `${Prefix}${K}` | PathsOfObject<T[K], `${Prefix}${K}.`>
      : `${Prefix}${K}`;
}[keyof T & string];

/**
 * Used for extracting type-safe paths from objects with depth limiting
 *
 * @returns a string of keys separated by dots
 *
 * @example
 * ```
 * PathKeys<Pokemon> // 'name' | 'berry.name' | 'ingredient0.*.amount' | 'ingredient0.0.amount' ...
 * ```
 */
export type PathKeys<T> = T extends object ? PathsOfObject<T> : never;
