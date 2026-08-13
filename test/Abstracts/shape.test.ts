import { beforeEach, describe, expect, it } from "vitest";

import { Point2d } from "../../src/Abstracts/point2d.js";
import { ShapeConst, ShapeUtils } from "../../src/Abstracts/shape.js";

const SQUARE: Point2d[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
];

const TRIANGLE: Point2d[] = [
    { x: 50, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
];

describe("ShapeConst.CORNER_SHAPE_LAME_EXPONENTS", () => {
    it("matches the CSS corner-shape keywords", () => {
        expect(ShapeConst.CORNER_SHAPE_LAME_EXPONENTS).toEqual({
            square: Infinity,
            squircle: 2,
            round: 1,
            bevel: 0,
            scoop: -1,
            notch: -Infinity,
        });
    });
});

describe("ShapeConst.getDefaultShapePoints", () => {
    const size = { width: 100, height: 60 };

    it("builds every listed shape", () => {
        for (const shape of ShapeConst.DEFAULT_SHAPES) {
            expect(ShapeConst.getDefaultShapePoints(shape, size).length).toBeGreaterThanOrEqual(3);
        }
    });

    it("keeps every corner inside the box", () => {
        for (const shape of ShapeConst.DEFAULT_SHAPES) {
            for (const point of ShapeConst.getDefaultShapePoints(shape, size)) {
                expect(point.x).toBeGreaterThanOrEqual(0);
                expect(point.x).toBeLessThanOrEqual(size.width);
                expect(point.y).toBeGreaterThanOrEqual(0);
                expect(point.y).toBeLessThanOrEqual(size.height);
            }
        }
    });

    it("gives the expected corner counts", () => {
        expect(ShapeConst.getDefaultShapePoints("triangle-up", size)).toHaveLength(3);
        expect(ShapeConst.getDefaultShapePoints("triangle-down", size)).toHaveLength(3);
        expect(ShapeConst.getDefaultShapePoints("square", size)).toHaveLength(4);
        expect(ShapeConst.getDefaultShapePoints("lozenge", size)).toHaveLength(4);
        expect(ShapeConst.getDefaultShapePoints("hexagon-pointy-top", size)).toHaveLength(6);
        expect(ShapeConst.getDefaultShapePoints("hexagon-flat-top", size)).toHaveLength(6);
    });

    it("stretches the shape to fill the box", () => {
        expect(ShapeConst.getDefaultShapePoints("square", size)).toEqual([
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 60 },
            { x: 0, y: 60 },
        ]);
        expect(ShapeConst.getDefaultShapePoints("triangle-up", size)).toEqual([
            { x: 50, y: 0 },
            { x: 100, y: 60 },
            { x: 0, y: 60 },
        ]);
    });
});

describe("ShapeUtils.pointsToPath", () => {
    it("joins points into a closed path", () => {
        expect(
            ShapeUtils.pointsToPath([
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 0, y: 10 },
            ]),
        ).toBe("M 0 0L 10 0L 0 10Z");
    });

    it("gives an empty string for anything that cannot enclose an area", () => {
        expect(ShapeUtils.pointsToPath([])).toBe("");
        expect(ShapeUtils.pointsToPath([{ x: 0, y: 0 }])).toBe("");
        expect(
            ShapeUtils.pointsToPath([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ]),
        ).toBe("");
    });
});

describe("ShapeUtils.getInnerRect", () => {
    it("returns an all-zero rectangle for fewer than three points", () => {
        expect(ShapeUtils.getInnerRect([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
        expect(
            ShapeUtils.getInnerRect([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ]),
        ).toEqual({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        });
    });

    it("fills a rectangle entirely", () => {
        const rect = ShapeUtils.getInnerRect(SQUARE);

        expect(rect.x).toBeCloseTo(0, 6);
        expect(rect.y).toBeCloseTo(0, 6);
        expect(rect.width).toBeCloseTo(10, 6);
        expect(rect.height).toBeCloseTo(10, 6);
    });

    it("stays inside a triangle and still has real area", () => {
        const rect = ShapeUtils.getInnerRect(TRIANGLE);

        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(100);
        expect(rect.y + rect.height).toBeLessThanOrEqual(100);

        // Every corner of the result must sit within the triangle's own width at that
        // height: the triangle narrows towards the top, so the top edge is the binding
        // constraint.
        const halfWidthAt = (y: number) => (y / 100) * 50;

        expect(rect.x).toBeGreaterThanOrEqual(50 - halfWidthAt(rect.y) - 1e-6);
        expect(rect.x + rect.width).toBeLessThanOrEqual(50 + halfWidthAt(rect.y) + 1e-6);
    });
});

describe("ShapeUtils.setupPaths", () => {
    it("gives an empty but well-formed result for fewer than three corners", () => {
        const result = ShapeUtils.setupPaths([{ x: 0, y: 0 }], [0]);

        expect(result.outer.vertices).toEqual([]);
        expect(result.inner.vertices).toEqual([]);
        expect(result.vectors.unitTangents).toEqual([]);
        expect(result.hasThickness).toBe(false);
        expect(result.hasRadii).toBe(false);
    });

    it("reports whether there is any thickness or radius at all", () => {
        expect(ShapeUtils.setupPaths(SQUARE, [0]).hasThickness).toBe(false);
        expect(ShapeUtils.setupPaths(SQUARE, [2]).hasThickness).toBe(true);
        expect(ShapeUtils.setupPaths(SQUARE, [0], [0]).hasRadii).toBe(false);
        expect(ShapeUtils.setupPaths(SQUARE, [0], [3]).hasRadii).toBe(true);
    });

    it("pads short lists CSS-shorthand style, by repeating the last entry", () => {
        const result = ShapeUtils.setupPaths(SQUARE, [1, 2]);

        expect(result.common.edgeThicknesses).toEqual([1, 2, 2, 2]);
    });

    it("leaves the corners where they are when there is no thickness or offset", () => {
        const result = ShapeUtils.setupPaths(SQUARE, [0]);

        result.outer.vertices.forEach((v, i) => {
            expect(v.x).toBeCloseTo(SQUARE[i].x, 6);
            expect(v.y).toBeCloseTo(SQUARE[i].y, 6);
        });
        expect(result.inner.vertices).toEqual(SQUARE);
    });

    it("pulls the inner wall in by the thickness", () => {
        const result = ShapeUtils.setupPaths(SQUARE, [2]);

        expect(result.inner.vertices[0].x).toBeCloseTo(2, 6);
        expect(result.inner.vertices[0].y).toBeCloseTo(2, 6);
        expect(result.inner.vertices[2].x).toBeCloseTo(8, 6);
        expect(result.inner.vertices[2].y).toBeCloseTo(8, 6);
    });

    it("scales neighbouring radii down together so they never overlap", () => {
        // Each edge is 10 long, so two radii of 8 would need 16. They are scaled by
        // 10/16 to fit, giving 5 each.
        const result = ShapeUtils.setupPaths(SQUARE, [0], [8, 8, 8, 8]);

        for (const radius of result.outer.joinRadii) {
            expect(radius).toBeCloseTo(5, 6);
        }
    });

    it("leaves radii alone when they already fit", () => {
        const result = ShapeUtils.setupPaths(SQUARE, [0], [3, 3, 3, 3]);

        for (const radius of result.outer.joinRadii) {
            expect(radius).toBeCloseTo(3, 6);
        }
    });

    it("points each normal outwards, away from the centre", () => {
        const result = ShapeUtils.setupPaths(SQUARE, [0]);

        // Edge 0 runs along the top of the square, so its outward normal points up.
        expect(result.vectors.unitNormals[0].x).toBeCloseTo(0, 6);
        expect(result.vectors.unitNormals[0].y).toBeCloseTo(-1, 6);
    });
});

describe("ShapeUtils.getPaths", () => {
    beforeEach(() => ShapeUtils.clearPathCache());

    it("gives empty paths for fewer than three corners", () => {
        expect(ShapeUtils.getPaths([{ x: 0, y: 0 }], [0])).toEqual({
            outerPath: "",
            innerPath: "",
            outerPoints: [],
            innerPoints: [],
        });
    });

    it("builds a straight-edged path when there are no radii", () => {
        const { outerPath } = ShapeUtils.getPaths(SQUARE, [0]);

        expect(outerPath).toBe("M 0.000 10.000 L 0.000 0.000 L 10.000 0.000 L 10.000 10.000 L 0.000 10.000 Z");
    });

    it("matches the inner path to the outer one when there is no thickness", () => {
        const paths = ShapeUtils.getPaths(SQUARE, [0]);

        expect(paths.innerPath).toBe(paths.outerPath);
        expect(paths.innerPoints).toBe(paths.outerPoints);
    });

    it("pulls the inner path in by the thickness", () => {
        const paths = ShapeUtils.getPaths(SQUARE, [2]);

        expect(paths.innerPath).toBe("M 2.000 8.000 L 2.000 2.000 L 8.000 2.000 L 8.000 8.000 L 2.000 8.000 Z");
        expect(paths.innerPath).not.toBe(paths.outerPath);
    });

    it("pushes the whole outline out for a positive offset", () => {
        const paths = ShapeUtils.getPaths(SQUARE, [0], undefined, undefined, 1);

        expect(paths.outerPath).toBe(
            "M -1.000 11.000 L -1.000 -1.000 L 11.000 -1.000 L 11.000 11.000 L -1.000 11.000 Z",
        );
    });

    it("draws curved corners when given radii", () => {
        const rounded = ShapeUtils.getPaths(SQUARE, [0], [3]);
        const sharp = ShapeUtils.getPaths(SQUARE, [0], [0]);

        expect(rounded.outerPath).not.toBe(sharp.outerPath);
        expect(rounded.outerPoints.length).toBeGreaterThan(SQUARE.length);
        expect(rounded.outerPath.startsWith("M ")).toBe(true);
        expect(rounded.outerPath.endsWith(" Z")).toBe(true);
        expect(rounded.outerPath).not.toContain("NaN");
    });

    it("draws a bevel as three points rather than a curve", () => {
        const bevel = ShapeUtils.getPaths(SQUARE, [0], [3], [0]);

        // One arc start, one meeting point and one arc end per corner.
        expect(bevel.outerPoints.length).toBe(SQUARE.length * 2);
        expect(bevel.outerPath).not.toContain("NaN");
    });

    it("survives two corners sitting in the same spot", () => {
        const degenerate = ShapeUtils.getPaths(
            [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
            ],
            [0],
        );

        expect(degenerate.outerPath).not.toContain("NaN");
    });

    it("returns the very same result for the same arguments", () => {
        const first = ShapeUtils.getPaths(SQUARE, [0], [3]);
        const second = ShapeUtils.getPaths(SQUARE, [0], [3]);

        expect(second).toBe(first);
    });

    it("tells different arguments apart", () => {
        const a = ShapeUtils.getPaths(SQUARE, [0], [3]);
        const b = ShapeUtils.getPaths(SQUARE, [0], [4]);

        expect(b).not.toBe(a);
    });

    it("recomputes after the cache is cleared", () => {
        const first = ShapeUtils.getPaths(SQUARE, [0], [3]);

        ShapeUtils.clearPathCache();

        const second = ShapeUtils.getPaths(SQUARE, [0], [3]);

        expect(second).not.toBe(first);
        expect(second).toEqual(first);
    });
});

describe("ShapeUtils.getRectPadding", () => {
    it("needs no padding without a radius or an outline", () => {
        expect(ShapeUtils.getRectPadding([0], [0])).toEqual({
            "padding-top": "0px",
            "padding-right": "0px",
            "padding-bottom": "0px",
            "padding-left": "0px",
        });
    });

    it("never pads less than the outline thickness", () => {
        expect(ShapeUtils.getRectPadding([2], [0])).toEqual({
            "padding-top": "2px",
            "padding-right": "2px",
            "padding-bottom": "2px",
            "padding-left": "2px",
        });
    });

    it("accounts for how far a rounded corner cuts in", () => {
        // A round corner of 10 keeps content about 3px clear of the box edge.
        expect(ShapeUtils.getRectPadding([0], [10])).toEqual({
            "padding-top": "3px",
            "padding-right": "3px",
            "padding-bottom": "3px",
            "padding-left": "3px",
        });
    });

    it("varies per side, in CSS order", () => {
        const padding = ShapeUtils.getRectPadding([0, 0, 0, 0], [0, 20, 0, 0]);

        expect(padding["padding-top"]).toBe("0px");
        expect(padding["padding-right"]).not.toBe("0px");
        expect(padding["padding-bottom"]).toBe("0px");
        expect(padding["padding-left"]).toBe("0px");
    });

    it("pads less for a squarer corner than a rounder one", () => {
        const round = ShapeUtils.getRectPadding([0], [20], [1]);
        const squircle = ShapeUtils.getRectPadding([0], [20], [2]);

        expect(parseFloat(String(squircle["padding-top"]))).toBeLessThan(parseFloat(String(round["padding-top"])));
    });
});

describe("ShapeUtils.getPolygonPadding", () => {
    it("needs no padding when the shape already fills its box", () => {
        expect(ShapeUtils.getPolygonPadding({ width: 10, height: 10 }, SQUARE)).toEqual({
            "padding-top": "0px",
            "padding-left": "0px",
            "padding-bottom": "0px",
            "padding-right": "0px",
        });
    });

    it("pads around the usable middle of a non-rectangular shape", () => {
        const padding = ShapeUtils.getPolygonPadding({ width: 100, height: 100 }, TRIANGLE);

        // A triangle's usable rectangle sits below the point, so the top needs padding.
        expect(parseFloat(String(padding["padding-top"]))).toBeGreaterThan(0);
        expect(parseFloat(String(padding["padding-left"]))).toBeGreaterThan(0);
        expect(parseFloat(String(padding["padding-right"]))).toBeGreaterThan(0);
    });
});
