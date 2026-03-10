import {
    Vec2d,
    Vec2dString,
    addVec2d,
    divVec2d,
    isSameVec2d,
    mulVec2d,
    stringToVec2d,
    subVec2d,
    vec2dToString,
} from "./vec2d";

const K1 = "rows";
const K2 = "cols";

export type Count2d = Vec2d<typeof K1, typeof K2>;
export type Count2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Count2d {
    export const add = addVec2d(K1, K2);
    export const sub = subVec2d(K1, K2);
    export const mul = mulVec2d(K1, K2);
    export const div = divVec2d(K1, K2);
    export const isSame = isSameVec2d(K1, K2);
    export const toString = vec2dToString(K1, K2);
}

export namespace Count2dString {
    export const toCount2d = stringToVec2d(K1, K2);
}
