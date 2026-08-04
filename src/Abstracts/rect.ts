import { Point2d } from "./point.js";
import { Size2d } from "./size.js";
import { Vec4d, Vec4dString } from "./vec4d.js";

const K1 = "x";
const K2 = "y";
const K3 = "width";
const K4 = "height";

/** A rectangle given by its top-left corner plus a width and height. */
export type Rect = Vec4d<typeof K1, typeof K2, typeof K3, typeof K4>;

/** A {@link Rect} flattened into a string, for example `X0_Y0_WIDTH10_HEIGHT20`. Handy as a map key. */
export type RectString = Vec4dString<typeof K1, typeof K2, typeof K3, typeof K4>;

/** Arithmetic on {@link Rect} values. Every operation returns a new rectangle and modifies nothing. */
export namespace Rect {
    /** Takes the smaller of each field from two rectangles. Gives `undefined` if either is missing. */
    export const min = Vec4d.min(K1, K2, K3, K4);
    /** Takes the larger of each field from two rectangles. Gives `undefined` if either is missing. */
    export const max = Vec4d.max(K1, K2, K3, K4);
    /** Adds two rectangles field by field. */
    export const add = Vec4d.add(K1, K2, K3, K4);
    /** Subtracts the second rectangle from the first, field by field. */
    export const sub = Vec4d.sub(K1, K2, K3, K4);
    /** Multiplies two rectangles field by field. */
    export const mul = Vec4d.mul(K1, K2, K3, K4);
    /** Divides the first rectangle by the second, field by field. */
    export const div = Vec4d.div(K1, K2, K3, K4);
    /** Tests whether two rectangles match exactly. */
    export const isSame = Vec4d.isSame(K1, K2, K3, K4);
    /** Builds a rectangle with the same number in all four fields. */
    export const spread = Vec4d.spread(K1, K2, K3, K4);
    /** Flattens a rectangle into a string such as `X0_Y0_WIDTH10_HEIGHT20`. */
    export const toString = Vec4d.toString(K1, K2, K3, K4);
}

export namespace RectString {
    /** Parses a string such as `X0_Y0_WIDTH10_HEIGHT20` back into a {@link Rect}. */
    export const fromString = Vec4d.fromString(K1, K2, K3, K4);
}

export namespace RectUtils {
    /**
     * Scales one box to sit inside another as large as possible, without distorting it,
     * and centres it.
     *
     * This is `object-fit: contain` in arithmetic form. The whole of `fitThis` stays
     * visible and any leftover room becomes even margins on two sides.
     *
     * @param fitThis The box being scaled. A zero width or height gives `Infinity`.
     * @param intoThis The box to fit inside.
     * @returns Where to draw it, plus the `scale` that was applied.
     */
    export const fit = (fitThis: Size2d, intoThis: Size2d): Rect & { scale: number } => {
        const scale = Math.min(intoThis.width / fitThis.width, intoThis.height / fitThis.height);
        const width = fitThis.width * scale;
        const height = fitThis.height * scale;
        const x = (intoThis.width - width) * 0.5;
        const y = (intoThis.height - height) * 0.5;

        return { x, y, width, height, scale };
    };

    /**
     * Sorts two corners into low and high edges, whichever way round they were given.
     *
     * Lets a drag selection work in any direction without the caller having to sort out
     * which corner came first.
     */
    export const getNormalizedBounds = (start: Point2d, end: Point2d) => ({
        minX: Math.min(start.x, end.x),
        maxX: Math.max(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxY: Math.max(start.y, end.y),
    });

    /**
     * Tests whether a point falls within a rectangle.
     *
     * Points exactly on an edge count as inside.
     */
    export const isPointInsideRect = (point: Point2d, rect: Rect): boolean => {
        const right = rect.x + rect.width;
        const bottom = rect.y + rect.height;

        return point.x >= rect.x && point.x <= right && point.y >= rect.y && point.y <= bottom;
    };

    /**
     * Tests whether two rectangles touch or overlap at all.
     *
     * Rectangles that merely share an edge count as overlapping. Unlike
     * {@link hasAnyCornerInside}, this also catches a cross shape, where two rectangles
     * overlap without either one's corners landing inside the other.
     *
     * @returns `false` if either rectangle is missing.
     */
    export const hasAreaOverlap = (a?: Rect, b?: Rect): boolean => {
        if (!a || !b) return false;

        const aRight = a.x + a.width;
        const aBottom = a.y + a.height;
        const bRight = b.x + b.width;
        const bBottom = b.y + b.height;

        return a.x <= bRight && aRight >= b.x && a.y <= bBottom && aBottom >= b.y;
    };

    /**
     * Tests whether either rectangle has a corner sitting inside the other.
     *
     * Stricter than {@link hasAreaOverlap}: two rectangles crossing in a plus shape
     * overlap in area but have no corner inside each other, so this reports `false`
     * for them.
     *
     * @returns `false` if either rectangle is missing.
     */
    export const hasAnyCornerInside = (a?: Rect, b?: Rect): boolean => {
        if (!a || !b) return false;

        const aRight = a.x + a.width;
        const aBottom = a.y + a.height;
        const bRight = b.x + b.width;
        const bBottom = b.y + b.height;

        return (
            isPointInsideRect({ x: a.x, y: a.y }, b) ||
            isPointInsideRect({ x: a.x, y: aBottom }, b) ||
            isPointInsideRect({ x: aRight, y: aBottom }, b) ||
            isPointInsideRect({ x: aRight, y: a.y }, b) ||
            isPointInsideRect({ x: b.x, y: b.y }, a) ||
            isPointInsideRect({ x: b.x, y: bBottom }, a) ||
            isPointInsideRect({ x: bRight, y: bBottom }, a) ||
            isPointInsideRect({ x: bRight, y: b.y }, a)
        );
    };
}
