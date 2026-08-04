import { Vec2d, Vec2dString } from "./vec2d.js";

const K1 = "width";
const K2 = "height";

/** A width and a height. */
export type Size2d = Vec2d<typeof K1, typeof K2>;

/** A {@link Size2d} flattened into a string, for example `WIDTH10_HEIGHT20`. Handy as a map key. */
export type Size2dString = Vec2dString<typeof K1, typeof K2>;

/** Arithmetic on {@link Size2d} values. Every operation returns a new size and modifies nothing. */
export namespace Size2d {
    /** Takes the smaller width and the smaller height of two sizes. Gives `undefined` if either is missing. */
    export const min = Vec2d.min(K1, K2);
    /** Takes the larger width and the larger height of two sizes. Gives `undefined` if either is missing. */
    export const max = Vec2d.max(K1, K2);
    /** Adds two sizes together. */
    export const add = Vec2d.add(K1, K2);
    /** Subtracts the second size from the first. */
    export const sub = Vec2d.sub(K1, K2);
    /** Multiplies width by width and height by height. To scale by one number, pass it in both fields. */
    export const mul = Vec2d.mul(K1, K2);
    /** Divides width by width and height by height. */
    export const div = Vec2d.div(K1, K2);
    /** Tests whether two sizes match exactly. */
    export const isSame = Vec2d.isSame(K1, K2);
    /** Flattens a size into a string such as `WIDTH10_HEIGHT20`. */
    export const toString = Vec2d.toString(K1, K2);
}

export namespace Size2dString {
    /** Parses a string such as `WIDTH10_HEIGHT20` back into a {@link Size2d}. */
    export const fromString = Vec2d.fromString(K1, K2);
}
