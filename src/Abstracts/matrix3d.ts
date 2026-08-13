import { MathUtils } from "./math.js";
import { Point3d } from "./point3d.js";

const SIZE = 3;
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/**
 * A 3×3 matrix held as nine numbers in row-major order.
 *
 * Row-major means the first three entries are the top row, so the entry at row `r` and
 * column `c` sits at index `r * 3 + c`.
 */
export type Matrix3d = [number, number, number, number, number, number, number, number, number];

/** Builders and arithmetic for {@link Matrix3d} transforms. */
export namespace Matrix3dUtils {
    /**
     * Combines two transforms into one.
     *
     * Order matters and reads right to left: `multiply(a, b)` applied to a vector gives the
     * same result as applying `b` first and then `a`.
     *
     * @param a The transform applied second.
     * @param b The transform applied first.
     * @returns A new matrix. Neither input is modified.
     */
    export const multiply = (a: Matrix3d, b: Matrix3d): Matrix3d =>
        CELLS.map((idx) => {
            const row = Math.floor(idx / SIZE) * SIZE;
            const col = idx % SIZE;

            return a[row] * b[col] + a[row + 1] * b[SIZE + col] + a[row + 2] * b[2 * SIZE + col];
        }) as Matrix3d;

    /**
     * Runs a point through a transform.
     *
     * @param m The transform to apply.
     * @param v The point to transform.
     * @returns A new point. Neither input is modified.
     */
    export const apply = (m: Matrix3d, v: Point3d): Point3d => ({
        x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
        y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
        z: m[6] * v.x + m[7] * v.y + m[8] * v.z,
    });

    /**
     * Builds a rotation about the X axis, which leaves `x` alone and turns `y` towards `z`.
     *
     * @param degrees How far to turn. Negative turns the other way.
     */
    export const rotationX = (degrees: number): Matrix3d => {
        const radians = degrees * MathUtils.RADIANS_PER_DEGREE;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [1, 0, 0, 0, cos, -sin, 0, sin, cos];
    };

    /**
     * Builds a rotation about the Y axis, which leaves `y` alone and turns `z` towards `x`.
     *
     * @param degrees How far to turn. Negative turns the other way.
     */
    export const rotationY = (degrees: number): Matrix3d => {
        const radians = degrees * MathUtils.RADIANS_PER_DEGREE;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [cos, 0, sin, 0, 1, 0, -sin, 0, cos];
    };

    /**
     * Builds a rotation about the Z axis, which leaves `z` alone and turns `x` towards `y`.
     *
     * @param degrees How far to turn. Negative turns the other way.
     */
    export const rotationZ = (degrees: number): Matrix3d => {
        const radians = degrees * MathUtils.RADIANS_PER_DEGREE;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
    };

    /**
     * Builds a transform that stretches the X and Y axes, leaving Z untouched.
     *
     * @param scaleX How much to stretch sideways. `1` leaves it alone, negative flips it.
     * @param scaleY How much to stretch up and down.
     */
    export const scaling = (scaleX: number, scaleY: number): Matrix3d => [scaleX, 0, 0, 0, scaleY, 0, 0, 0, 1];
}
