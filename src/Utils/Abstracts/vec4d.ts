export type Vec4d<A extends string, B extends string, C extends string, D extends string> = {
    [K in A | B | C | D]: number;
};

export type Vec4dString<
    A extends string,
    B extends string,
    C extends string,
    D extends string,
> = `${Uppercase<A>}${number}_${Uppercase<B>}${number}_${Uppercase<C>}${number}_${Uppercase<D>}${number}`;

export namespace Vec4d {
    export const isSame =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (a?: Vec4d<A, B, C, D>, b?: Vec4d<A, B, C, D>): boolean =>
            !!a && !!b && a[k1] === b[k1] && a[k2] === b[k2] && a[k3] === b[k3] && a[k4] === b[k4];

    export const toString =
        <A extends string, B extends string, C extends string, D extends string>(k1: A, k2: B, k3: C, k4: D) =>
        (v: Vec4d<A, B, C, D>): Vec4dString<A, B, C, D> =>
            `${k1.toUpperCase()}${v[k1]}_${k2.toUpperCase()}${v[k2]}_${k3.toUpperCase()}${v[k3]}_${k4.toUpperCase()}${v[k4]}` as Vec4dString<
                A,
                B,
                C,
                D
            >;

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
