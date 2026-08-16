/** Shared immutable helpers — reconstructed for the incomplete source dump. */

export type DeepImmutable<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => DeepImmutable<R>
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
    : T extends Set<infer U>
      ? ReadonlySet<DeepImmutable<U>>
      : T extends object
        ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
        : T

/** All permutations of a union of string literals. */
export type Permutations<T extends string, U extends string = T> = [T] extends [
  never,
]
  ? []
  : T extends U
    ? [T, ...Permutations<Exclude<U, T>>]
    : never
