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
export type PathValue<T, Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? T[Head] extends Array<infer U>
      ? Rest extends `${number}.${infer RestAfterIndex}` | `*.${infer RestAfterIndex}`
        ? PathValue<U, RestAfterIndex>
        : Rest extends `${number}` | '*'
          ? U
          : never
      : PathValue<T[Head], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : Path extends `${number}` | '*'
      ? T extends Array<infer U>
        ? U
        : never
      : never;
