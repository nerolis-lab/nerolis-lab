/**
 * Used for extracting type-safe paths from objects
 *
 * @returns a string of keys separated by dots
 *
 * @example
 * ```
 * PathKeys<Pokemon> // 'name' | 'berry.name' | 'ingredient0.*.amount' | 'ingredient0.0.amount' ...
 * ```
 */
export type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathKeys<T[K]>}`
          : T[K] extends readonly (infer U)[]
            ? U extends object
              ? K | `${K}.${number}` | `${K}.${number}.${PathKeys<U>}` | `${K}.*.${PathKeys<U>}`
              : K | `${K}.${number}` | `${K}.*`
            : K
        : never;
    }[keyof T]
  : never;
