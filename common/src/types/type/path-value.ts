/**
 * Utility types for extracting the value type at a given path in an object
 */

/**
 * Extract the type at a given path in an object
 * Supports dot notation, array indices, and wildcards
 *
 * @example
 * type Obj = { a: { b: { c: number } }, d: string[] };
 * type Value1 = PathValue<Obj, 'a.b.c'>; // number
 * type Value2 = PathValue<Obj, 'd.0'>; // string
 * type Value3 = PathValue<Obj, 'd.*'>; // string
 */
export type PathValue<T, Path extends string> = Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? T[K] extends readonly (infer U)[]
        ? Rest extends '*'
          ? U
          : Rest extends `${number}.${infer R}`
            ? PathValue<U, R>
            : Rest extends `${number}`
              ? U
              : Rest extends `*.${infer R}`
                ? PathValue<U, R>
                : PathValue<T[K], Rest>
        : PathValue<T[K], Rest>
      : never
    : Path extends `${number}.${infer Rest}`
      ? T extends readonly (infer U)[]
        ? PathValue<U, Rest>
        : never
      : Path extends '*'
        ? T extends readonly (infer U)[]
          ? U
          : never
        : Path extends `${number}`
          ? T extends readonly (infer U)[]
            ? U
            : never
          : never;

/**
 * Helper type to check if a path is valid for a given type
 */
export type IsValidPath<T, Path> = Path extends string ? (PathValue<T, Path> extends never ? false : true) : false;

/**
 * Get all possible value types for any path in an object
 * This is useful for union types where different paths may have different types
 */
export type AllPathValues<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? T[K] | AllPathValues<T[K]>
        : T[K] extends readonly (infer U)[]
          ? T[K] | U | (U extends object ? AllPathValues<U> : never)
          : T[K];
    }[keyof T]
  : never;
