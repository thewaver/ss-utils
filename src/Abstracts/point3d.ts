import { Vec3d, Vec3dString } from "./vec3d.js";

const K1 = "x";
const K2 = "y";
const K3 = "z";

/** A position (or direction) in 3D space. */
export type Point3d = Vec3d<typeof K1, typeof K2, typeof K3>;

/** A {@link Point3d} flattened into a string, for example `X10_Y20_Z30`. Handy as a map key. */
export type Point3dString = Vec3dString<typeof K1, typeof K2, typeof K3>;

/** Arithmetic on {@link Point3d} values. Every operation returns a new point and modifies nothing. */
export namespace Point3d {
    /** Takes the smaller of each axis from two points. Gives `undefined` if either is missing. */
    export const min = Vec3d.min(K1, K2, K3);
    /** Takes the larger of each axis from two points. Gives `undefined` if either is missing. */
    export const max = Vec3d.max(K1, K2, K3);
    /** Adds two points together. */
    export const add = Vec3d.add(K1, K2, K3);
    /** Subtracts the second point from the first. */
    export const sub = Vec3d.sub(K1, K2, K3);
    /** Multiplies axis by matching axis. To scale by one number, build it with {@link spread} first. */
    export const mul = Vec3d.mul(K1, K2, K3);
    /** Divides axis by matching axis. */
    export const div = Vec3d.div(K1, K2, K3);
    /** Tests whether two points sit at exactly the same place. */
    export const isSame = Vec3d.isSame(K1, K2, K3);
    /** Fills all three axes with the same number. */
    export const spread = Vec3d.spread(K1, K2, K3);
    /** Flattens a point into a string such as `X10_Y20_Z30`. */
    export const toString = Vec3d.toString(K1, K2, K3);
}

export namespace Point3dString {
    /** Parses a string such as `X10_Y20_Z30` back into a {@link Point3d}. */
    export const fromString = Vec3d.fromString(K1, K2, K3);
}
