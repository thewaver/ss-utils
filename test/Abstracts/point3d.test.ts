import { describe, expect, it } from "vitest";

import { Point3d, Point3dString } from "../../src/Abstracts/point3d.js";

describe("Point3d.min / max", () => {
    it("combines axis by axis", () => {
        expect(Point3d.min({ x: 1, y: 9, z: 4 }, { x: 5, y: 2, z: 4 })).toEqual({ x: 1, y: 2, z: 4 });
        expect(Point3d.max({ x: 1, y: 9, z: 4 }, { x: 5, y: 2, z: 4 })).toEqual({ x: 5, y: 9, z: 4 });
    });

    it("gives undefined if either side is missing", () => {
        expect(Point3d.min(undefined, { x: 1, y: 1, z: 1 })).toBeUndefined();
        expect(Point3d.max({ x: 1, y: 1, z: 1 }, undefined)).toBeUndefined();
    });
});

describe("Point3d arithmetic", () => {
    it("adds, subtracts, multiplies and divides axis by axis", () => {
        expect(Point3d.add({ x: 1, y: 2, z: 3 }, { x: 10, y: 20, z: 30 })).toEqual({ x: 11, y: 22, z: 33 });
        expect(Point3d.sub({ x: 10, y: 20, z: 30 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 9, y: 18, z: 27 });
        expect(Point3d.mul({ x: 3, y: 4, z: 5 }, { x: 2, y: 5, z: 10 })).toEqual({ x: 6, y: 20, z: 50 });
        expect(Point3d.div({ x: 6, y: 20, z: 50 }, { x: 2, y: 5, z: 10 })).toEqual({ x: 3, y: 4, z: 5 });
    });

    it("scales by one number when paired with spread", () => {
        expect(Point3d.mul({ x: 1, y: 2, z: 3 }, Point3d.spread(10))).toEqual({ x: 10, y: 20, z: 30 });
    });

    it("does not modify either input", () => {
        const a = { x: 1, y: 2, z: 3 };
        const b = { x: 4, y: 5, z: 6 };

        Point3d.add(a, b);

        expect(a).toEqual({ x: 1, y: 2, z: 3 });
        expect(b).toEqual({ x: 4, y: 5, z: 6 });
    });
});

describe("Point3d.isSame", () => {
    it("needs every axis to match", () => {
        expect(Point3d.isSame({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(true);
        expect(Point3d.isSame({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 })).toBe(false);
    });

    it("is false if either side is missing", () => {
        expect(Point3d.isSame(undefined, { x: 1, y: 2, z: 3 })).toBe(false);
        expect(Point3d.isSame({ x: 1, y: 2, z: 3 }, undefined)).toBe(false);
    });
});

describe("Point3d.toString / Point3dString.fromString", () => {
    it("flattens a point into an upper case string", () => {
        expect(Point3d.toString({ x: 10, y: 20, z: 30 })).toBe("X10_Y20_Z30");
    });

    it("reads its own output back", () => {
        const p: Point3d = { x: -1.5, y: 0, z: 2.25 };

        expect(Point3dString.fromString(Point3d.toString(p))).toEqual(p);
    });
});
