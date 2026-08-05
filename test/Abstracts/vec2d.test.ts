import { describe, expect, it } from "vitest";

import { Vec2d } from "../../src/Abstracts/vec2d.js";

const min = Vec2d.min("x", "y");
const max = Vec2d.max("x", "y");
const add = Vec2d.add("x", "y");
const sub = Vec2d.sub("x", "y");
const mul = Vec2d.mul("x", "y");
const div = Vec2d.div("x", "y");
const isSame = Vec2d.isSame("x", "y");
const toString = Vec2d.toString("x", "y");
const fromString = Vec2d.fromString("x", "y");

describe("Vec2d.min / max", () => {
    it("combines field by field", () => {
        expect(min({ x: 1, y: 9 }, { x: 5, y: 2 })).toEqual({ x: 1, y: 2 });
        expect(max({ x: 1, y: 9 }, { x: 5, y: 2 })).toEqual({ x: 5, y: 9 });
    });

    it("gives undefined if either side is missing", () => {
        expect(min(undefined, { x: 1, y: 1 })).toBeUndefined();
        expect(min({ x: 1, y: 1 }, undefined)).toBeUndefined();
        expect(max(undefined, undefined)).toBeUndefined();
    });
});

describe("Vec2d arithmetic", () => {
    it("adds, subtracts, multiplies and divides field by field", () => {
        expect(add({ x: 1, y: 2 }, { x: 10, y: 20 })).toEqual({ x: 11, y: 22 });
        expect(sub({ x: 10, y: 20 }, { x: 1, y: 2 })).toEqual({ x: 9, y: 18 });
        expect(mul({ x: 3, y: 4 }, { x: 2, y: 5 })).toEqual({ x: 6, y: 20 });
        expect(div({ x: 6, y: 20 }, { x: 2, y: 5 })).toEqual({ x: 3, y: 4 });
    });

    it("yields Infinity when dividing by zero", () => {
        expect(div({ x: 1, y: -1 }, { x: 0, y: 0 })).toEqual({ x: Infinity, y: -Infinity });
    });

    it("does not modify either input", () => {
        const a = { x: 1, y: 2 };
        const b = { x: 3, y: 4 };

        add(a, b);

        expect(a).toEqual({ x: 1, y: 2 });
        expect(b).toEqual({ x: 3, y: 4 });
    });
});

describe("Vec2d.isSame", () => {
    it("compares field by field", () => {
        expect(isSame({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
        expect(isSame({ x: 1, y: 2 }, { x: 1, y: 3 })).toBe(false);
    });

    it("is false when either side is missing", () => {
        expect(isSame(undefined, { x: 1, y: 2 })).toBe(false);
        expect(isSame({ x: 1, y: 2 }, undefined)).toBe(false);
        expect(isSame(undefined, undefined)).toBe(false);
    });
});

describe("Vec2d.toString / fromString", () => {
    it("flattens to an upper-case key form", () => {
        expect(toString({ x: 10, y: 20 })).toBe("X10_Y20");
    });

    it("parses back, including negatives and fractions", () => {
        expect(fromString("X-10_Y2.5")).toEqual({ x: -10, y: 2.5 });
    });

    it("round-trips", () => {
        const value = { x: -3, y: 7 };

        expect(fromString(toString(value))).toEqual(value);
    });

    it("uses whatever key names it was built with", () => {
        const sizeToString = Vec2d.toString("width", "height");

        expect(sizeToString({ width: 4, height: 8 })).toBe("WIDTH4_HEIGHT8");
        expect(Vec2d.fromString("width", "height")("WIDTH4_HEIGHT8")).toEqual({ width: 4, height: 8 });
    });
});
