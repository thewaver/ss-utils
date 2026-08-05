import { describe, expect, it } from "vitest";

import { Point2d, Point2dString, Point2dUtils } from "../../src/Abstracts/point.js";

describe("Point2d", () => {
    it("re-exports the shared two-number arithmetic under x/y", () => {
        expect(Point2d.add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
        expect(Point2d.sub({ x: 3, y: 4 }, { x: 1, y: 2 })).toEqual({ x: 2, y: 2 });
        expect(Point2d.mul({ x: 3, y: 4 }, { x: 2, y: 2 })).toEqual({ x: 6, y: 8 });
        expect(Point2d.div({ x: 6, y: 8 }, { x: 2, y: 2 })).toEqual({ x: 3, y: 4 });
        expect(Point2d.min({ x: 1, y: 9 }, { x: 5, y: 2 })).toEqual({ x: 1, y: 2 });
        expect(Point2d.max({ x: 1, y: 9 }, { x: 5, y: 2 })).toEqual({ x: 5, y: 9 });
        expect(Point2d.isSame({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    });

    it("round-trips through a string key", () => {
        expect(Point2d.toString({ x: 10, y: 20 })).toBe("X10_Y20");
        expect(Point2dString.fromString("X10_Y20")).toEqual({ x: 10, y: 20 });
    });
});

describe("Point2dUtils angle conversions", () => {
    it("converts both ways", () => {
        expect(Point2dUtils.radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
        expect(Point2dUtils.degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
        expect(Point2dUtils.radiansToDegrees(Point2dUtils.degreesToRadians(37))).toBeCloseTo(37, 10);
    });
});

describe("Point2dUtils.getNormal", () => {
    it("shrinks to length 1 while keeping the direction", () => {
        expect(Point2dUtils.getNormal({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });
        expect(Point2dUtils.getDistance(Point2dUtils.getNormal({ x: -7, y: 2 }))).toBeCloseTo(1, 10);
    });

    it("gives the origin back for a zero direction", () => {
        expect(Point2dUtils.getNormal({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    });
});

describe("Point2dUtils.getPerpendicular", () => {
    it("turns a quarter turn anticlockwise", () => {
        expect(Point2dUtils.getPerpendicular({ x: 1, y: 0 })).toEqual({ x: -0, y: 1 });
        expect(Point2dUtils.getPerpendicular({ x: 0, y: 1 })).toEqual({ x: -1, y: 0 });
    });

    it("leaves the length alone", () => {
        expect(Point2dUtils.getDistance(Point2dUtils.getPerpendicular({ x: 3, y: 4 }))).toBe(5);
    });
});

describe("Point2dUtils.getDistance", () => {
    it("measures from the origin", () => {
        expect(Point2dUtils.getDistance({ x: 3, y: 4 })).toBe(5);
        expect(Point2dUtils.getDistance({ x: 0, y: 0 })).toBe(0);
        expect(Point2dUtils.getDistance({ x: -3, y: -4 })).toBe(5);
    });
});

describe("Point2dUtils.getAngle", () => {
    it("uses screen coordinates, so 90 points down", () => {
        expect(Point2dUtils.getAngle({ x: 1, y: 0 })).toBe(0);
        expect(Point2dUtils.getAngle({ x: 0, y: 1 })).toBe(90);
        expect(Point2dUtils.getAngle({ x: -1, y: 0 })).toBe(180);
        expect(Point2dUtils.getAngle({ x: 0, y: -1 })).toBe(-90);
    });

    it("reports 0 for the origin, which has no direction", () => {
        expect(Point2dUtils.getAngle({ x: 0, y: 0 })).toBe(0);
    });
});

describe("Point2dUtils.polarToCartesian / cartesianToPolar", () => {
    it("converts a distance and direction into a position", () => {
        const p = Point2dUtils.polarToCartesian(2, 90);

        expect(p.x).toBeCloseTo(0, 10);
        expect(p.y).toBeCloseTo(2, 10);
    });

    it("converts a position into a distance and direction", () => {
        expect(Point2dUtils.cartesianToPolar({ x: 3, y: 4 })).toEqual({
            radius: 5,
            angle: Point2dUtils.getAngle({ x: 3, y: 4 }),
        });
    });

    it("round-trips", () => {
        const { radius, angle } = Point2dUtils.cartesianToPolar({ x: -3, y: 4 });
        const back = Point2dUtils.polarToCartesian(radius, angle);

        expect(back.x).toBeCloseTo(-3, 10);
        expect(back.y).toBeCloseTo(4, 10);
    });
});

describe("Point2dUtils.intersectLines", () => {
    it("finds where two lines cross", () => {
        const hit = Point2dUtils.intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: -5 }, { x: 0, y: 1 });

        expect(hit.x).toBeCloseTo(5, 10);
        expect(hit.y).toBeCloseTo(0, 10);
    });

    it("treats the lines as unbounded, so the crossing can fall outside either stretch", () => {
        const hit = Point2dUtils.intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 100, y: -1 }, { x: 0, y: 1 });

        expect(hit.x).toBeCloseTo(100, 10);
    });

    it("gives back the second point when the lines run parallel", () => {
        const point2 = { x: 5, y: 5 };

        expect(Point2dUtils.intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, point2, { x: 2, y: 0 })).toBe(point2);
    });

    it("takes a looser parallel threshold when asked", () => {
        const point2 = { x: 5, y: 5 };
        const nearlyParallel = { x: 1, y: 1e-7 };

        // Tight enough to still compute a (very distant) crossing...
        expect(Point2dUtils.intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, point2, nearlyParallel)).not.toBe(point2);
        // ...but loose enough to call it parallel.
        expect(Point2dUtils.intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, point2, nearlyParallel, 1e-6)).toBe(point2);
    });
});

describe("Point2dUtils.offsetEdge", () => {
    it("shifts a segment sideways at right angles", () => {
        const { a, b } = Point2dUtils.offsetEdge({ x: 0, y: 0 }, { x: 10, y: 0 }, 2);

        expect(a.x).toBeCloseTo(0, 10);
        expect(a.y).toBeCloseTo(2, 10);
        expect(b.x).toBeCloseTo(10, 10);
        expect(b.y).toBeCloseTo(2, 10);
    });

    it("shifts the other way for a negative offset", () => {
        const { a, b } = Point2dUtils.offsetEdge({ x: 0, y: 0 }, { x: 10, y: 0 }, -2);

        expect(a.y).toBeCloseTo(-2, 10);
        expect(b.y).toBeCloseTo(-2, 10);
    });

    it("keeps the segment the same length", () => {
        const { a, b } = Point2dUtils.offsetEdge({ x: 1, y: 1 }, { x: 4, y: 5 }, 3);

        expect(Point2dUtils.getDistance(Point2d.sub(b, a))).toBeCloseTo(5, 10);
    });
});
