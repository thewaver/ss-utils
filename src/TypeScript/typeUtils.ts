/** Allows `null` alongside the original type. */
export type Nullable<T> = T | null;

/**
 * Adds a prefix to every key of an object type.
 *
 * `Prepend<{ width: number }, "min">` gives `{ minWidth: number }`.
 *
 * @typeParam S The prefix to add.
 * @typeParam NoCap Set to `true` to leave the original key lowercase, giving
 * `minwidth` rather than `minWidth`.
 */
export type Prepend<T, S extends string, NoCap extends boolean = false> = {
    [K in Extract<keyof T, string> as `${S}${NoCap extends true ? K : Capitalize<K>}`]: T[K];
};

/**
 * Adds a suffix to every key of an object type.
 *
 * `Append<{ border: number }, "width">` gives `{ borderWidth: number }`.
 *
 * @typeParam S The suffix to add.
 * @typeParam NoCap Set to `true` to leave the suffix lowercase, giving `borderwidth`
 * rather than `borderWidth`.
 */
export type Append<T, S extends string, NoCap extends boolean = false> = {
    [K in Extract<keyof T, string> as `${K}${NoCap extends true ? S : Capitalize<S>}`]: T[K];
};

/**
 * Swaps the types of chosen keys while keeping the rest as they were.
 *
 * `Redefine<{ x: number; y: number }, { x: string }>` gives `{ x: string; y: number }`.
 * Unlike a plain intersection, the original type is genuinely replaced rather than
 * combined with the new one.
 */
export type Redefine<T1, T2 extends { [K in keyof T1]?: any }> = {
    [K in keyof T1]: K extends keyof T2 ? T2[K] : T1[K];
};

/**
 * Makes chosen optional keys required, leaving the rest alone.
 *
 * Useful once a check has established that certain fields must be present.
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Collects the names of every key whose value matches a given type.
 *
 * `KeysOfType<{ a: number; b: string }, number>` gives `"a"`.
 */
export type KeysOfType<T extends object, KT> = {
    [K in keyof T]: T[K] extends KT ? K : never;
}[keyof T];

/**
 * Keeps only the keys whose names contain a given piece of text.
 *
 * `PickContaining<CSSProperties, "Color">` narrows a style type down to its colour
 * properties.
 */
export type PickContaining<T extends object, S extends string> = {
    [K in keyof T as K extends `${infer A}${S}${infer B}` ? K : never]: T[K];
};

/** Pulls out what an array holds. `ArrayElementType<string[]>` gives `string`. */
export type ArrayElementType<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;
