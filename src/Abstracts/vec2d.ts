/** A pair of numbers stored under two caller-chosen key names, such as `x`/`y` or `width`/`height`. */
export type Vec2d<A extends string, B extends string> = {
    [K in A | B]: number;
};

/** A {@link Vec2d} flattened into a string, for example `X10_Y20`. Handy as a map key. */
export type Vec2dString<A extends string, B extends string> = `${Uppercase<A>}${number}_${Uppercase<B>}${number}`;

/**
 * Builders for two-number value types.
 *
 * Each entry here is a factory: you call it once with the two key names to get back a
 * ready-made operation, which the concrete types then re-export. `Point2d`, `Size2d`
 * and `Count2d` are all built this way, which is why they share an identical set of
 * operations without repeating the arithmetic.
 */
export namespace Vec2d {
    /**
     * Builds a function that takes the smaller of each field from two values.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const min =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a?: Vec2d<A, B>, b?: Vec2d<A, B>): Vec2d<A, B> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.min(a[k1], b[k1]),
                      [k2]: Math.min(a[k2], b[k2]),
                  } as Vec2d<A, B>)
                : undefined;

    /**
     * Builds a function that takes the larger of each field from two values.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const max =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a?: Vec2d<A, B>, b?: Vec2d<A, B>): Vec2d<A, B> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.max(a[k1], b[k1]),
                      [k2]: Math.max(a[k2], b[k2]),
                  } as Vec2d<A, B>)
                : undefined;

    /**
     * Builds a function that adds two values field by field.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value. Neither input is modified.
     */
    export const add =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
            ({
                [k1]: a[k1] + b[k1],
                [k2]: a[k2] + b[k2],
            }) as Vec2d<A, B>;

    /**
     * Builds a function that subtracts the second value from the first, field by field.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value. Neither input is modified.
     */
    export const sub =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
            ({
                [k1]: a[k1] - b[k1],
                [k2]: a[k2] - b[k2],
            }) as Vec2d<A, B>;

    /**
     * Builds a function that multiplies two values field by field.
     *
     * Note this pairs up matching fields rather than scaling by a single number — to
     * scale, pass the same number in both fields.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value. Neither input is modified.
     */
    export const mul =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
            ({
                [k1]: a[k1] * b[k1],
                [k2]: a[k2] * b[k2],
            }) as Vec2d<A, B>;

    /**
     * Builds a function that divides the first value by the second, field by field.
     *
     * Dividing by zero yields `Infinity` in that field, matching plain JavaScript.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning a new value. Neither input is modified.
     */
    export const div =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
            ({
                [k1]: a[k1] / b[k1],
                [k2]: a[k2] / b[k2],
            }) as Vec2d<A, B>;

    /**
     * Builds a function that compares two values field by field.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     * @returns A function returning `true` only if both inputs exist and every field matches.
     */
    export const isSame =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (a?: Vec2d<A, B>, b?: Vec2d<A, B>): boolean =>
            !!a && !!b && a[k1] === b[k1] && a[k2] === b[k2];

    /**
     * Builds a function that flattens a value into a string such as `X10_Y20`.
     *
     * Useful as a map key or a React `key`. Reverse it with {@link fromString}.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     */
    export const toString =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (v: Vec2d<A, B>): Vec2dString<A, B> =>
            `${k1.toUpperCase()}${v[k1]}_${k2.toUpperCase()}${v[k2]}` as Vec2dString<A, B>;

    /**
     * Builds a function that parses a string produced by {@link toString} back into a value.
     *
     * The key names are only used to work out how many leading characters to skip, so
     * they must match the ones used to write the string.
     *
     * @param k1 Name of the first field.
     * @param k2 Name of the second field.
     */
    export const fromString =
        <A extends string, B extends string>(k1: A, k2: B) =>
        (s: Vec2dString<A, B>): Vec2d<A, B> => {
            const [a, b] = s.split("_");

            return {
                [k1]: Number(a.slice(k1.length)),
                [k2]: Number(b.slice(k2.length)),
            } as Vec2d<A, B>;
        };
}
