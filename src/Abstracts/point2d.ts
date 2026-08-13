import { MathUtils } from "./math.js";
import { Size2d } from "./size.js";
import { Vec2d, Vec2dString } from "./vec2d.js";

const K1 = "x";
const K2 = "y";

/** A position (or direction) on a 2D plane. */
export type Point2d = Vec2d<typeof K1, typeof K2>;

/** A {@link Point2d} flattened into a string, for example `X10_Y20`. Handy as a map key. */
export type Point2dString = Vec2dString<typeof K1, typeof K2>;

/** Arithmetic on {@link Point2d} values. Every operation returns a new point and modifies nothing. */
export namespace Point2d {
    /** Takes the smaller `x` and the smaller `y` of two points. Gives `undefined` if either is missing. */
    export const min = Vec2d.min(K1, K2);
    /** Takes the larger `x` and the larger `y` of two points. Gives `undefined` if either is missing. */
    export const max = Vec2d.max(K1, K2);
    /** Adds two points together. */
    export const add = Vec2d.add(K1, K2);
    /** Subtracts the second point from the first. */
    export const sub = Vec2d.sub(K1, K2);
    /** Multiplies `x` by `x` and `y` by `y`. To scale by one number, pass it in both fields. */
    export const mul = Vec2d.mul(K1, K2);
    /** Divides `x` by `x` and `y` by `y`. */
    export const div = Vec2d.div(K1, K2);
    /** Tests whether two points sit at exactly the same place. */
    export const isSame = Vec2d.isSame(K1, K2);
    /** Flattens a point into a string such as `X10_Y20`. */
    export const toString = Vec2d.toString(K1, K2);
}

export namespace Point2dString {
    /** Parses a string such as `X10_Y20` back into a {@link Point2d}. */
    export const fromString = Vec2d.fromString(K1, K2);
}

export namespace Point2dUtils {
    /** Converts radians to degrees. */
    export const radiansToDegrees = (radians: number): number => radians * MathUtils.DEGREES_PER_RADIAN;

    /** Converts degrees to radians. */
    export const degreesToRadians = (degrees: number): number => degrees * MathUtils.RADIANS_PER_DEGREE;

    /**
     * Shrinks a direction down to length 1, keeping the way it points.
     *
     * @returns A point of length 1, or `{ x: 0, y: 0 }` if the input had no length to
     * begin with (a zero direction cannot point anywhere).
     */
    export const getNormal = (p: Point2d): Point2d => {
        const dist = getLength(p);

        return dist === 0 ? { x: 0, y: 0 } : { x: p.x / dist, y: p.y / dist };
    };

    /**
     * Pulls a point back inside a box, leaving it alone if it already fits.
     *
     * @param bounds The box to stay within. Its corners are the origin and
     * `{ x: width, y: height }`.
     */
    export const getBoundPoint = (p: Point2d, bounds: Size2d): Point2d => ({
        x: Math.max(Math.min(p.x, bounds.width), 0),
        y: Math.max(Math.min(p.y, bounds.height), 0),
    });

    /**
     * Rotates a direction a quarter turn anticlockwise, giving the direction at right
     * angles to it.
     *
     * The length is unchanged, so feed it a result from {@link getNormal} if you want a
     * unit-length result.
     */
    export const getPerpendicular = (p: Point2d): Point2d => ({ x: -p.y, y: p.x });

    /**
     * Measures the gap between two points along each axis on its own.
     *
     * @returns How far apart they are sideways and up-and-down, never negative. For the
     * straight-line distance instead, subtract the points and pass that to
     * {@link getLength}.
     */
    export const getDelta = (p1: Point2d, p2: Point2d): Point2d => ({
        x: Math.abs(p2.x - p1.x),
        y: Math.abs(p2.y - p1.y),
    });

    /**
     * Measures how far a cell sits from the further away of the two grid edges it lies
     * between, on each axis on its own.
     *
     * @param p A cell inside the grid, with both coordinates zero or more.
     * @param bounds How many cells the grid holds each way, so the last cell sits at
     * `width - 1` and `height - 1`.
     * @returns The larger of the two gaps per axis.
     */
    export const getFarthestBound = (p: Point2d, bounds: Size2d): Point2d => ({
        x: Math.max(bounds.width - 1 - p.x, p.x),
        y: Math.max(bounds.height - 1 - p.y, p.y),
    });

    /**
     * Measures how far a cell sits from the nearer of the two grid edges it lies between,
     * on each axis on its own.
     *
     * @param p A cell inside the grid, with both coordinates zero or more.
     * @param bounds How many cells the grid holds each way, so the last cell sits at
     * `width - 1` and `height - 1`.
     * @returns The smaller of the two gaps per axis.
     */
    export const getNearestBound = (p: Point2d, bounds: Size2d): Point2d => ({
        x: Math.min(bounds.width - 1 - p.x, p.x),
        y: Math.min(bounds.height - 1 - p.y, p.y),
    });

    /**
     * Works out which way a point faces from the origin, in degrees.
     *
     * `0` points right, `90` points down (screen coordinates run downwards), `180`
     * points left. Results run from -180 to 180. The origin itself has no direction, so
     * it reports `0`.
     */
    export const getAngle = (p: Point2d): number => radiansToDegrees(Math.atan2(p.y, p.x));

    /** Measures how far a point sits from the origin, in a straight line. */
    export const getLength = (p: Point2d): number => Math.hypot(p.x, p.y);

    /**
     * Converts a distance and a direction into a position.
     *
     * @param radius How far from the origin.
     * @param angle Which way to face, in degrees. See {@link getAngle} for the convention.
     */
    export const polarToCartesian = (radius: number, angle: number): Point2d => ({
        x: radius * Math.cos(angle * MathUtils.RADIANS_PER_DEGREE),
        y: radius * Math.sin(angle * MathUtils.RADIANS_PER_DEGREE),
    });

    /**
     * Converts a position into a distance and a direction.
     *
     * @returns The distance from the origin, and the angle in degrees from -180 to 180.
     */
    export const cartesianToPolar = (p: Point2d) => ({
        radius: getLength(p),
        angle: getAngle(p),
    });

    /**
     * Finds where two infinite lines cross.
     *
     * Each line is described by a point it passes through plus the direction it runs
     * in — **not** by two endpoints. The lines are treated as unbounded, so the result
     * may land well outside the stretch you had in mind.
     *
     * @param point1 Any point on the first line.
     * @param dir1 Which way the first line runs.
     * @param point2 Any point on the second line.
     * @param dir2 Which way the second line runs.
     * @param parallelEpsilon How near to parallel counts as never meeting. Lower values
     * keep computing an intersection for lines that are very nearly parallel, which
     * lands it very far away.
     * @returns Where they cross, or `point2` if the lines run parallel and never meet.
     */
    export const intersectLines = (
        point1: Point2d,
        dir1: Point2d,
        point2: Point2d,
        dir2: Point2d,
        parallelEpsilon: number = 1e-8,
    ): Point2d => {
        const cross = dir1.x * dir2.y - dir1.y * dir2.x;

        if (Math.abs(cross) < parallelEpsilon) return point2;

        const qp = Point2d.sub(point2, point1);
        const t = (qp.x * dir2.y - qp.y * dir2.x) / cross;

        return Point2d.add(point1, Point2d.mul(dir1, { x: t, y: t }));
    };

    /**
     * Shifts a line segment sideways, at right angles to the way it runs.
     *
     * Used to build the walls of a thick outline: offset each edge, then intersect the
     * neighbours to find the corners.
     *
     * @param a Start of the segment.
     * @param b End of the segment.
     * @param offset How far to shift. Negative shifts the other way.
     * @returns The two shifted endpoints.
     */
    export const offsetEdge = (a: Point2d, b: Point2d, offset: number) => {
        const d = getNormal(Point2d.sub(b, a));
        const n = getPerpendicular(d);
        const o = Point2d.mul(n, { x: offset, y: offset });

        return {
            a: Point2d.add(a, o),
            b: Point2d.add(b, o),
        };
    };
}
