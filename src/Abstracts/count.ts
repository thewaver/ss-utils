import { Vec2d, Vec2dString } from "./vec2d.js";

const K1 = "rows";
const K2 = "cols";

/** A grid tally: how many rows and how many columns. */
export type Count2d = Vec2d<typeof K1, typeof K2>;

/** A {@link Count2d} flattened into a string, for example `ROWS3_COLS4`. Handy as a map key. */
export type Count2dString = Vec2dString<typeof K1, typeof K2>;

/** Arithmetic on {@link Count2d} values. Every operation returns a new tally and modifies nothing. */
export namespace Count2d {
    /** Takes the smaller row count and the smaller column count. Gives `undefined` if either is missing. */
    export const min = Vec2d.min(K1, K2);
    /** Takes the larger row count and the larger column count. Gives `undefined` if either is missing. */
    export const max = Vec2d.max(K1, K2);
    /** Adds two tallies together. */
    export const add = Vec2d.add(K1, K2);
    /** Subtracts the second tally from the first. */
    export const sub = Vec2d.sub(K1, K2);
    /** Multiplies rows by rows and columns by columns. */
    export const mul = Vec2d.mul(K1, K2);
    /** Divides rows by rows and columns by columns. */
    export const div = Vec2d.div(K1, K2);
    /** Tests whether two tallies match exactly. */
    export const isSame = Vec2d.isSame(K1, K2);
    /** Flattens a tally into a string such as `ROWS3_COLS4`. */
    export const toString = Vec2d.toString(K1, K2);
}

export namespace Count2dString {
    /** Parses a string such as `ROWS3_COLS4` back into a {@link Count2d}. */
    export const fromString = Vec2d.fromString(K1, K2);
}
