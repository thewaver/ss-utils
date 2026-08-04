/** Four numbers stored under caller-chosen key names, such as `x`/`y`/`width`/`height`. */
export type Vec4d<A extends string, B extends string, C extends string, D extends string> = {
    [K in A | B | C | D]: number;
};

/** A {@link Vec4d} flattened into a string, for example `X0_Y0_WIDTH10_HEIGHT20`. Handy as a map key. */
export type Vec4dString<
    A extends string,
    B extends string,
    C extends string,
    D extends string,
> = `${Uppercase<A>}${number}_${Uppercase<B>}${number}_${Uppercase<C>}${number}_${Uppercase<D>}${number}`;

/**
 * Builders for four-number value types.
 *
 * Each entry here is a factory: you call it once with the four key names to get back a
 * ready-made operation, which the concrete types then re-export. `Rect` and `Bounds`
 * are both built this way, which is why they share an identical set of operations
 * without repeating the arithmetic.
 */
export namespace Vec4d {
    /**
     * Builds a function that takes the smaller of each field from two values.
     *
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const min =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a?: Vec4d<A, B, C, D>, b?: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.min(a[k1], b[k1]),
                      [k2]: Math.min(a[k2], b[k2]),
                      [k3]: Math.min(a[k3], b[k3]),
                      [k4]: Math.min(a[k4], b[k4]),
                  } as Vec4d<A, B, C, D>)
                : undefined;

    /**
     * Builds a function that takes the larger of each field from two values.
     *
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const max =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a?: Vec4d<A, B, C, D>, b?: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.max(a[k1], b[k1]),
                      [k2]: Math.max(a[k2], b[k2]),
                      [k3]: Math.max(a[k3], b[k3]),
                      [k4]: Math.max(a[k4], b[k4]),
                  } as Vec4d<A, B, C, D>)
                : undefined;

    /**
     * Builds a function that adds two values field by field.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const add =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a: Vec4d<A, B, C, D>, b: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> =>
            ({
                [k1]: a[k1] + b[k1],
                [k2]: a[k2] + b[k2],
                [k3]: a[k3] + b[k3],
                [k4]: a[k4] + b[k4],
            }) as Vec4d<A, B, C, D>;

    /**
     * Builds a function that subtracts the second value from the first, field by field.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const sub =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a: Vec4d<A, B, C, D>, b: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> =>
            ({
                [k1]: a[k1] - b[k1],
                [k2]: a[k2] - b[k2],
                [k3]: a[k3] - b[k3],
                [k4]: a[k4] - b[k4],
            }) as Vec4d<A, B, C, D>;

    /**
     * Builds a function that multiplies two values field by field.
     *
     * Note this pairs up matching fields rather than scaling by a single number — to
     * scale, use {@link spread} to build the multiplier first.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const mul =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a: Vec4d<A, B, C, D>, b: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> =>
            ({
                [k1]: a[k1] * b[k1],
                [k2]: a[k2] * b[k2],
                [k3]: a[k3] * b[k3],
                [k4]: a[k4] * b[k4],
            }) as Vec4d<A, B, C, D>;

    /**
     * Builds a function that divides the first value by the second, field by field.
     *
     * Dividing by zero yields `Infinity` in that field, matching plain JavaScript.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const div =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a: Vec4d<A, B, C, D>, b: Vec4d<A, B, C, D>): Vec4d<A, B, C, D> =>
            ({
                [k1]: a[k1] / b[k1],
                [k2]: a[k2] / b[k2],
                [k3]: a[k3] / b[k3],
                [k4]: a[k4] / b[k4],
            }) as Vec4d<A, B, C, D>;

    /**
     * Builds a function that compares two values field by field.
     *
     * @returns A function returning `true` only if both inputs exist and every field matches.
     */
    export const isSame =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a?: Vec4d<A, B, C, D>, b?: Vec4d<A, B, C, D>): boolean =>
            !!a && !!b && a[k1] === b[k1] && a[k2] === b[k2] && a[k3] === b[k3] && a[k4] === b[k4];

    /**
     * Builds a function that fills all four fields with the same number.
     *
     * The four-sided equivalent of CSS shorthand — `Bounds.spread(4)` gives a uniform
     * inset on every side.
     */
    export const spread =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (value: number): Vec4d<A, B, C, D> =>
            ({
                [k1]: value,
                [k2]: value,
                [k3]: value,
                [k4]: value,
            }) as Vec4d<A, B, C, D>;

    /**
     * Builds a function that flattens a value into a string such as `X0_Y0_WIDTH10_HEIGHT20`.
     *
     * Useful as a map key or a React `key`. Reverse it with {@link fromString}.
     */
    export const toString =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (v: Vec4d<A, B, C, D>): Vec4dString<A, B, C, D> =>
            `${k1.toUpperCase()}${v[k1]}_${k2.toUpperCase()}${v[k2]}_${k3.toUpperCase()}${v[k3]}_${k4.toUpperCase()}${v[k4]}` as Vec4dString<
                A,
                B,
                C,
                D
            >;

    /**
     * Builds a function that parses a string produced by {@link toString} back into a value.
     *
     * The key names are only used to work out how many leading characters to skip, so
     * they must match the ones used to write the string.
     */
    export const fromString =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (v: Vec4dString<A, B, C, D>): Vec4d<A, B, C, D> => {
            const [a, b, c, d] = v.split("_");

            return {
                [k1]: Number(a.slice(k1.length)),
                [k2]: Number(b.slice(k2.length)),
                [k3]: Number(c.slice(k3.length)),
                [k4]: Number(d.slice(k4.length)),
            } as Vec4d<A, B, C, D>;
        };
}
