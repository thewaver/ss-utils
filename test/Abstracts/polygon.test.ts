import { describe, expect, it } from "vitest";

import { Point2d } from "../../src/Abstracts/point2d.js";
import { PolygonUtils } from "../../src/Abstracts/polygon.js";

const SQUARE: Point2d[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
];

describe("PolygonUtils.pointsToSVGString", () => {
    it("formats points for an SVG points attribute", () => {
        expect(PolygonUtils.pointsToSVGString(SQUARE)).toBe("0,0 10,0 10,10 0,10");
    });

    it("gives an empty string for no points", () => {
        expect(PolygonUtils.pointsToSVGString([])).toBe("");
    });
});

describe("PolygonUtils.getEdgeNormal", () => {
    it("points at right angles to the edge, with length 1", () => {
        const normal = PolygonUtils.getEdgeNormal({ x: 0, y: 0 }, { x: 10, y: 0 });

        expect(normal.x).toBeCloseTo(0, 10);
        expect(normal.y).toBeCloseTo(1, 10);
    });

    it("flips when the corners are given the other way round", () => {
        const forward = PolygonUtils.getEdgeNormal({ x: 0, y: 0 }, { x: 10, y: 0 });
        const backward = PolygonUtils.getEdgeNormal({ x: 10, y: 0 }, { x: 0, y: 0 });

        expect(backward.y).toBeCloseTo(-forward.y, 10);
    });

    it("always has length 1", () => {
        const normal = PolygonUtils.getEdgeNormal({ x: 1, y: 2 }, { x: 4, y: 6 });

        expect(Math.hypot(normal.x, normal.y)).toBeCloseTo(1, 10);
    });

    it("gives NaN for a zero-length edge, which has no sides", () => {
        const normal = PolygonUtils.getEdgeNormal({ x: 3, y: 3 }, { x: 3, y: 3 });

        expect(normal.x).toBeNaN();
        expect(normal.y).toBeNaN();
    });
});

describe("PolygonUtils.getLineIntersection", () => {
    it("finds where two lines cross", () => {
        const hit = PolygonUtils.getLineIntersection({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: -5 }, { x: 0, y: 1 });

        expect(hit.x).toBeCloseTo(5, 10);
        expect(hit.y).toBeCloseTo(0, 10);
    });

    it("treats nearly parallel edges as parallel", () => {
        const p2 = { x: 5, y: 5 };

        // Below the 1e-6 threshold this uses, so it gives back p2 rather than a crossing
        // point somewhere off in the distance.
        expect(PolygonUtils.getLineIntersection({ x: 0, y: 0 }, { x: 1, y: 0 }, p2, { x: 1, y: 1e-7 })).toBe(p2);
    });
});

describe("PolygonUtils.insetPolygon", () => {
    it("pushes every edge inwards by the same amount", () => {
        const inset = PolygonUtils.insetPolygon(SQUARE, 2);

        expect(inset).toHaveLength(4);
        expect(inset[0].x).toBeCloseTo(2, 10);
        expect(inset[0].y).toBeCloseTo(2, 10);
        expect(inset[1].x).toBeCloseTo(8, 10);
        expect(inset[1].y).toBeCloseTo(2, 10);
        expect(inset[2].x).toBeCloseTo(8, 10);
        expect(inset[2].y).toBeCloseTo(8, 10);
        expect(inset[3].x).toBeCloseTo(2, 10);
        expect(inset[3].y).toBeCloseTo(8, 10);
    });

    it("pushes outwards for a negative shift", () => {
        const outset = PolygonUtils.insetPolygon(SQUARE, -2);

        expect(outset[0].x).toBeCloseTo(-2, 10);
        expect(outset[0].y).toBeCloseTo(-2, 10);
        expect(outset[2].x).toBeCloseTo(12, 10);
        expect(outset[2].y).toBeCloseTo(12, 10);
    });

    it("keeps corners sharp rather than rounding them off", () => {
        const inset = PolygonUtils.insetPolygon(SQUARE, 2);

        expect(inset).toHaveLength(SQUARE.length);
    });

    it("leaves the shape alone for a zero shift", () => {
        const inset = PolygonUtils.insetPolygon(SQUARE, 0);

        inset.forEach((p, i) => {
            expect(p.x).toBeCloseTo(SQUARE[i].x, 10);
            expect(p.y).toBeCloseTo(SQUARE[i].y, 10);
        });
    });

    it("does not modify the input", () => {
        const input = SQUARE.map((p) => ({ ...p }));

        PolygonUtils.insetPolygon(input, 3);

        expect(input).toEqual(SQUARE);
    });
});
