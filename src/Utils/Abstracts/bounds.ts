import { Vec4d, Vec4dString } from "./vec4d";

const K1 = "left";
const K2 = "top";
const K3 = "right";
const K4 = "bottom";

export type Bounds = Vec4d<typeof K1, typeof K2, typeof K3, typeof K4>;
export type BoundsString = Vec4dString<typeof K1, typeof K2, typeof K3, typeof K4>;

export namespace Bounds {
    export const isSame = Vec4d.isSame(K1, K2, K3, K4);
    export const toString = Vec4d.toString(K1, K2, K3, K4);
}

export namespace BoundsString {
    export const fromString = Vec4d.fromString(K1, K2, K3, K4);
}
