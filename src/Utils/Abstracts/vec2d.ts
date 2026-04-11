export type Vec2d<A extends string, B extends string> = {
    [K in A | B]: number;
};

export type Vec2dString<A extends string, B extends string> = `${Uppercase<A>}${number}_${Uppercase<B>}${number}`;

export const minVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> | undefined =>
        a !== undefined || b !== undefined
            ? ({
                  [k1]: Math.min(a[k1], b[k1]),
                  [k2]: Math.min(a[k2], b[k2]),
              } as Vec2d<A, B>)
            : undefined;

export const maxVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> | undefined =>
        a !== undefined || b !== undefined
            ? ({
                  [k1]: Math.max(a[k1], b[k1]),
                  [k2]: Math.max(a[k2], b[k2]),
              } as Vec2d<A, B>)
            : undefined;

export const addVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
        ({
            [k1]: a[k1] + b[k1],
            [k2]: a[k2] + b[k2],
        }) as Vec2d<A, B>;

export const subVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
        ({
            [k1]: a[k1] - b[k1],
            [k2]: a[k2] - b[k2],
        }) as Vec2d<A, B>;

export const mulVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
        ({
            [k1]: a[k1] * b[k1],
            [k2]: a[k2] * b[k2],
        }) as Vec2d<A, B>;

export const divVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a: Vec2d<A, B>, b: Vec2d<A, B>): Vec2d<A, B> =>
        ({
            [k1]: a[k1] / b[k1],
            [k2]: a[k2] / b[k2],
        }) as Vec2d<A, B>;

export const isSameVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (a?: Vec2d<A, B>, b?: Vec2d<A, B>): boolean =>
        !!a && !!b && a[k1] === b[k1] && a[k2] === b[k2];

export const vec2dToString =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (v: Vec2d<A, B>): Vec2dString<A, B> =>
        `${k1.toUpperCase()}${v[k1]}_${k2.toUpperCase()}${v[k2]}` as Vec2dString<A, B>;

export const stringToVec2d =
    <A extends string, B extends string>(k1: A, k2: B) =>
    (s: Vec2dString<A, B>): Vec2d<A, B> => {
        const [a, b] = s.split("_");

        return {
            [k1]: Number(a.slice(k1.length)),
            [k2]: Number(b.slice(k2.length)),
        } as Vec2d<A, B>;
    };
