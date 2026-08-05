import { describe, expect, it } from "vitest";

import { Vec4d } from "../../src/Abstracts/vec4d.js";

const KEYS = ["x", "y", "width", "height"] as const;

const min = Vec4d.min(...KEYS);
const max = Vec4d.max(...KEYS);
const add = Vec4d.add(...KEYS);
const sub = Vec4d.sub(...KEYS);
const mul = Vec4d.mul(...KEYS);
const div = Vec4d.div(...KEYS);
const isSame = Vec4d.isSame(...KEYS);
const spread = Vec4d.spread(...KEYS);
const toString = Vec4d.toString(...KEYS);
const fromString = Vec4d.fromString(...KEYS);

const a = { x: 1, y: 2, width: 3, height: 4 };
const b = { x: 10, y: 20, width: 30, height: 40 };

describe("Vec4d.min / max", () => {
    it("combines field by field", () => {
        expect(min(a, b)).toEqual(a);
        expect(max(a, b)).toEqual(b);
    });

    it("gives undefined if either side is missing", () => {
        expect(min(undefined, a)).toBeUndefined();
        expect(max(a, undefined)).toBeUndefined();
    });
});

describe("Vec4d arithmetic", () => {
    it("adds, subtracts, multiplies and divides field by field", () => {
        expect(add(a, b)).toEqual({ x: 11, y: 22, width: 33, height: 44 });
        expect(sub(b, a)).toEqual({ x: 9, y: 18, width: 27, height: 36 });
        expect(mul(a, spread(2))).toEqual({ x: 2, y: 4, width: 6, height: 8 });
        expect(div(b, spread(10))).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it("yields Infinity when dividing by zero", () => {
        expect(div(a, spread(0))).toEqual({
            x: Infinity,
            y: Infinity,
            width: Infinity,
            height: Infinity,
        });
    });

    it("does not modify either input", () => {
        add(a, b);

        expect(a).toEqual({ x: 1, y: 2, width: 3, height: 4 });
        expect(b).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });
});

describe("Vec4d.spread", () => {
    it("fills all four fields with the same number", () => {
        expect(spread(4)).toEqual({ x: 4, y: 4, width: 4, height: 4 });
    });
});

describe("Vec4d.isSame", () => {
    it("compares field by field", () => {
        expect(isSame(a, { ...a })).toBe(true);
        expect(isSame(a, { ...a, height: 99 })).toBe(false);
    });

    it("is false when either side is missing", () => {
        expect(isSame(undefined, a)).toBe(false);
        expect(isSame(a, undefined)).toBe(false);
    });
});

describe("Vec4d.toString / fromString", () => {
    it("flattens to an upper-case key form", () => {
        expect(toString({ x: 0, y: 0, width: 10, height: 20 })).toBe("X0_Y0_WIDTH10_HEIGHT20");
    });

    it("parses back, including negatives and fractions", () => {
        expect(fromString("X-1_Y0_WIDTH2.5_HEIGHT3")).toEqual({ x: -1, y: 0, width: 2.5, height: 3 });
    });

    it("round-trips", () => {
        expect(fromString(toString(a))).toEqual(a);
    });
});
