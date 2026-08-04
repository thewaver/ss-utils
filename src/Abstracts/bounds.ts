import { Vec4d, Vec4dString } from "./vec4d.js";

const K1 = "left";
const K2 = "top";
const K3 = "right";
const K4 = "bottom";

/**
 * Distances from each of the four sides, in CSS inset order.
 *
 * Unlike a `Rect`, this describes *edges* rather than a corner plus a size — the shape
 * CSS `inset`, `margin` and `padding` all take.
 */
export type Bounds = Vec4d<typeof K1, typeof K2, typeof K3, typeof K4>;

/** A {@link Bounds} flattened into a string, for example `LEFT0_TOP0_RIGHT10_BOTTOM20`. Handy as a map key. */
export type BoundsString = Vec4dString<typeof K1, typeof K2, typeof K3, typeof K4>;

/** Arithmetic on {@link Bounds} values. Every operation returns a new value and modifies nothing. */
export namespace Bounds {
    /** Takes the smaller of each side from two values. Gives `undefined` if either is missing. */
    export const min = Vec4d.min(K1, K2, K3, K4);
    /** Takes the larger of each side from two values. Gives `undefined` if either is missing. */
    export const max = Vec4d.max(K1, K2, K3, K4);
    /** Adds two values side by side. */
    export const add = Vec4d.add(K1, K2, K3, K4);
    /** Subtracts the second value from the first, side by side. */
    export const sub = Vec4d.sub(K1, K2, K3, K4);
    /** Multiplies two values side by side. */
    export const mul = Vec4d.mul(K1, K2, K3, K4);
    /** Divides the first value by the second, side by side. */
    export const div = Vec4d.div(K1, K2, K3, K4);
    /** Tests whether two values match exactly. */
    export const isSame = Vec4d.isSame(K1, K2, K3, K4);
    /** Builds a value with the same distance on all four sides, like one-value CSS shorthand. */
    export const spread = Vec4d.spread(K1, K2, K3, K4);
    /** Flattens a value into a string such as `LEFT0_TOP0_RIGHT10_BOTTOM20`. */
    export const toString = Vec4d.toString(K1, K2, K3, K4);
}

export namespace BoundsString {
    /** Parses a string such as `LEFT0_TOP0_RIGHT10_BOTTOM20` back into a {@link Bounds}. */
    export const fromString = Vec4d.fromString(K1, K2, K3, K4);
}
