import { Vec2d, Vec2dString } from "./vec2d";

const K1 = "rows";
const K2 = "cols";

export type Count2d = Vec2d<typeof K1, typeof K2>;
export type Count2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Count2d {
    export const min = Vec2d.min(K1, K2);
    export const max = Vec2d.max(K1, K2);
    export const add = Vec2d.add(K1, K2);
    export const sub = Vec2d.sub(K1, K2);
    export const mul = Vec2d.mul(K1, K2);
    export const div = Vec2d.div(K1, K2);
    export const isSame = Vec2d.isSame(K1, K2);
    export const toString = Vec2d.toString(K1, K2);
}

export namespace Count2dString {
    export const fromString = Vec2d.fromString(K1, K2);
}
