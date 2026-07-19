import { Vec4d, Vec4dString } from "./vec4d";

const K1 = "left";
const K2 = "top";
const K3 = "right";
const K4 = "bottom";

export type Bounds = Vec4d<typeof K1, typeof K2, typeof K3, typeof K4>;
export type BoundsString = Vec4dString<typeof K1, typeof K2, typeof K3, typeof K4>;

export namespace Bounds {
    export const min = Vec4d.min(K1, K2, K3, K4);
    export const max = Vec4d.max(K1, K2, K3, K4);
    export const add = Vec4d.add(K1, K2, K3, K4);
    export const sub = Vec4d.sub(K1, K2, K3, K4);
    export const mul = Vec4d.mul(K1, K2, K3, K4);
    export const div = Vec4d.div(K1, K2, K3, K4);
    export const isSame = Vec4d.isSame(K1, K2, K3, K4);
    export const spread = Vec4d.spread(K1, K2, K3, K4);
    export const toString = Vec4d.toString(K1, K2, K3, K4);
}

export namespace BoundsString {
    export const fromString = Vec4d.fromString(K1, K2, K3, K4);
}
