import { describe, expect, it } from "vitest";

import { Vec3d } from "../../src/Abstracts/vec3d.js";

const min = Vec3d.min("x", "y", "z");
const max = Vec3d.max("x", "y", "z");
const add = Vec3d.add("x", "y", "z");
const sub = Vec3d.sub("x", "y", "z");
const mul = Vec3d.mul("x", "y", "z");
const div = Vec3d.div("x", "y", "z");
const isSame = Vec3d.isSame("x", "y", "z");
const spread = Vec3d.spread("x", "y", "z");
const toString = Vec3d.toString("x", "y", "z");
const fromString = Vec3d.fromString("x", "y", "z");

describe("Vec3d.min / max", () => {
    it("combines field by field", () => {
        expect(min({ x: 1, y: 9, z: 4 }, { x: 5, y: 2, z: 4 })).toEqual({ x: 1, y: 2, z: 4 });
        expect(max({ x: 1, y: 9, z: 4 }, { x: 5, y: 2, z: 4 })).toEqual({ x: 5, y: 9, z: 4 });
    });

    it("gives undefined if either side is missing", () => {
        expect(min(undefined, { x: 1, y: 1, z: 1 })).toBeUndefined();
        expect(min({ x: 1, y: 1, z: 1 }, undefined)).toBeUndefined();
        expect(max(undefined, undefined)).toBeUndefined();
    });
});

describe("Vec3d arithmetic", () => {
    it("adds, subtracts, multiplies and divides field by field", () => {
        expect(add({ x: 1, y: 2, z: 3 }, { x: 10, y: 20, z: 30 })).toEqual({ x: 11, y: 22, z: 33 });
        expect(sub({ x: 10, y: 20, z: 30 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 9, y: 18, z: 27 });
        expect(mul({ x: 3, y: 4, z: 5 }, { x: 2, y: 5, z: 10 })).toEqual({ x: 6, y: 20, z: 50 });
        expect(div({ x: 6, y: 20, z: 50 }, { x: 2, y: 5, z: 10 })).toEqual({ x: 3, y: 4, z: 5 });
    });

    it("yields Infinity when dividing by zero", () => {
        expect(div({ x: 1, y: -1, z: 1 }, { x: 0, y: 0, z: 0 })).toEqual({
            x: Infinity,
            y: -Infinity,
            z: Infinity,
        });
    });

    it("does not modify either input", () => {
        const a = { x: 1, y: 2, z: 3 };
        const b = { x: 4, y: 5, z: 6 };

        add(a, b);

        expect(a).toEqual({ x: 1, y: 2, z: 3 });
        expect(b).toEqual({ x: 4, y: 5, z: 6 });
    });
});

describe("Vec3d.isSame", () => {
    it("needs every field to match", () => {
        expect(isSame({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(true);
        expect(isSame({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 })).toBe(false);
    });

    it("is false if either side is missing", () => {
        expect(isSame(undefined, { x: 1, y: 2, z: 3 })).toBe(false);
        expect(isSame({ x: 1, y: 2, z: 3 }, undefined)).toBe(false);
        expect(isSame(undefined, undefined)).toBe(false);
    });
});

describe("Vec3d.spread", () => {
    it("fills all three fields with one number", () => {
        expect(spread(4)).toEqual({ x: 4, y: 4, z: 4 });
    });

    it("scales a whole value when paired with mul", () => {
        expect(mul({ x: 1, y: 2, z: 3 }, spread(10))).toEqual({ x: 10, y: 20, z: 30 });
    });
});

describe("Vec3d.toString / fromString", () => {
    it("flattens a value into an upper case string", () => {
        expect(toString({ x: 10, y: 20, z: 30 })).toBe("X10_Y20_Z30");
    });

    it("reads its own output back", () => {
        expect(fromString(toString({ x: 10, y: 20, z: 30 }))).toEqual({ x: 10, y: 20, z: 30 });
    });

    it("survives negative and fractional values", () => {
        expect(fromString(toString({ x: -1.5, y: 0, z: 2.25 }))).toEqual({ x: -1.5, y: 0, z: 2.25 });
    });

    it("uses whatever key names it was built with", () => {
        const write = Vec3d.toString("width", "height", "depth");

        expect(write({ width: 1, height: 2, depth: 3 })).toBe("WIDTH1_HEIGHT2_DEPTH3");
        expect(Vec3d.fromString("width", "height", "depth")(write({ width: 1, height: 2, depth: 3 }))).toEqual({
            width: 1,
            height: 2,
            depth: 3,
        });
    });
});
