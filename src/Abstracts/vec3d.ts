/** Three numbers stored under caller-chosen key names, such as `x`/`y`/`z`. */
export type Vec3d<A extends string, B extends string, C extends string> = {
    [K in A | B | C]: number;
};

/** A {@link Vec3d} flattened into a string, for example `X10_Y20_Z30`. Handy as a map key. */
export type Vec3dString<
    A extends string,
    B extends string,
    C extends string,
> = `${Uppercase<A>}${number}_${Uppercase<B>}${number}_${Uppercase<C>}${number}`;

/**
 * Builders for three-number value types.
 *
 * Each entry here is a factory: you call it once with the three key names to get back a
 * ready-made operation, which the concrete types then re-export. `Vector3d` is built this
 * way, which is why it shares an identical set of operations with the two- and four-number
 * types without repeating the arithmetic.
 */
export namespace Vec3d {
    /**
     * Builds a function that takes the smaller of each field from two values.
     *
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const min =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a?: Vec3d<A, B, C>, b?: Vec3d<A, B, C>): Vec3d<A, B, C> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.min(a[k1], b[k1]),
                      [k2]: Math.min(a[k2], b[k2]),
                      [k3]: Math.min(a[k3], b[k3]),
                  } as Vec3d<A, B, C>)
                : undefined;

    /**
     * Builds a function that takes the larger of each field from two values.
     *
     * @returns A function returning a new value, or `undefined` if either input is missing.
     */
    export const max =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a?: Vec3d<A, B, C>, b?: Vec3d<A, B, C>): Vec3d<A, B, C> | undefined =>
            a !== undefined && b !== undefined
                ? ({
                      [k1]: Math.max(a[k1], b[k1]),
                      [k2]: Math.max(a[k2], b[k2]),
                      [k3]: Math.max(a[k3], b[k3]),
                  } as Vec3d<A, B, C>)
                : undefined;

    /**
     * Builds a function that adds two values field by field.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const add =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a: Vec3d<A, B, C>, b: Vec3d<A, B, C>): Vec3d<A, B, C> =>
            ({
                [k1]: a[k1] + b[k1],
                [k2]: a[k2] + b[k2],
                [k3]: a[k3] + b[k3],
            }) as Vec3d<A, B, C>;

    /**
     * Builds a function that subtracts the second value from the first, field by field.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const sub =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a: Vec3d<A, B, C>, b: Vec3d<A, B, C>): Vec3d<A, B, C> =>
            ({
                [k1]: a[k1] - b[k1],
                [k2]: a[k2] - b[k2],
                [k3]: a[k3] - b[k3],
            }) as Vec3d<A, B, C>;

    /**
     * Builds a function that multiplies two values field by field.
     *
     * Note this pairs up matching fields rather than scaling by a single number — to
     * scale, use {@link spread} to build the multiplier first.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const mul =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a: Vec3d<A, B, C>, b: Vec3d<A, B, C>): Vec3d<A, B, C> =>
            ({
                [k1]: a[k1] * b[k1],
                [k2]: a[k2] * b[k2],
                [k3]: a[k3] * b[k3],
            }) as Vec3d<A, B, C>;

    /**
     * Builds a function that divides the first value by the second, field by field.
     *
     * Dividing by zero yields `Infinity` in that field, matching plain JavaScript.
     *
     * @returns A function returning a new value. Neither input is modified.
     */
    export const div =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a: Vec3d<A, B, C>, b: Vec3d<A, B, C>): Vec3d<A, B, C> =>
            ({
                [k1]: a[k1] / b[k1],
                [k2]: a[k2] / b[k2],
                [k3]: a[k3] / b[k3],
            }) as Vec3d<A, B, C>;

    /**
     * Builds a function that compares two values field by field.
     *
     * @returns A function returning `true` only if both inputs exist and every field matches.
     */
    export const isSame =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (a?: Vec3d<A, B, C>, b?: Vec3d<A, B, C>): boolean =>
            !!a && !!b && a[k1] === b[k1] && a[k2] === b[k2] && a[k3] === b[k3];

    /**
     * Builds a function that fills all three fields with the same number.
     *
     * Handy as the other side of {@link mul}, where scaling everything by one number means
     * passing that number in every field.
     */
    export const spread =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (value: number): Vec3d<A, B, C> =>
            ({
                [k1]: value,
                [k2]: value,
                [k3]: value,
            }) as Vec3d<A, B, C>;

    /**
     * Builds a function that flattens a value into a string such as `X10_Y20_Z30`.
     *
     * Useful as a map key or a React `key`. Reverse it with {@link fromString}.
     */
    export const toString =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (v: Vec3d<A, B, C>): Vec3dString<A, B, C> =>
            `${k1.toUpperCase()}${v[k1]}_${k2.toUpperCase()}${v[k2]}_${k3.toUpperCase()}${v[k3]}` as Vec3dString<
                A,
                B,
                C
            >;

    /**
     * Builds a function that parses a string produced by {@link toString} back into a value.
     *
     * The key names are only used to work out how many leading characters to skip, so
     * they must match the ones used to write the string.
     */
    export const fromString =
        <A extends string, B extends string, C extends string>(k1: A, k2: B, k3: C) =>
        (v: Vec3dString<A, B, C>): Vec3d<A, B, C> => {
            const [a, b, c] = v.split("_");

            return {
                [k1]: Number(a.slice(k1.length)),
                [k2]: Number(b.slice(k2.length)),
                [k3]: Number(c.slice(k3.length)),
            } as Vec3d<A, B, C>;
        };
}
