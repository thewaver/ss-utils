import {
    Vec2d,
    Vec2dString,
    addVec2d,
    divVec2d,
    isSameVec2d,
    maxVec2d,
    minVec2d,
    mulVec2d,
    stringToVec2d,
    subVec2d,
    vec2dToString,
} from "./vec2d";

const K1 = "width";
const K2 = "height";

export type Size2d = Vec2d<typeof K1, typeof K2>;
export type Size2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Size2d {
    export const min = minVec2d(K1, K2);
    export const max = maxVec2d(K1, K2);
    export const add = addVec2d(K1, K2);
    export const sub = subVec2d(K1, K2);
    export const mul = mulVec2d(K1, K2);
    export const div = divVec2d(K1, K2);
    export const isSame = isSameVec2d(K1, K2);
    export const toString = vec2dToString(K1, K2);
}

export namespace Size2dString {
    export const toSize2d = stringToVec2d(K1, K2);
}
