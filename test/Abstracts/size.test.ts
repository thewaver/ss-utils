import { describe, expect, it } from "vitest";

import { Size2d, Size2dString } from "../../src/Abstracts/size.js";

const a = { width: 10, height: 20 };
const b = { width: 4, height: 40 };

describe("Size2d", () => {
    it("does arithmetic under width/height", () => {
        expect(Size2d.add(a, b)).toEqual({ width: 14, height: 60 });
        expect(Size2d.sub(a, b)).toEqual({ width: 6, height: -20 });
        expect(Size2d.mul(a, b)).toEqual({ width: 40, height: 800 });
        expect(Size2d.div(a, b)).toEqual({ width: 2.5, height: 0.5 });
    });

    it("takes the smaller or larger of each field", () => {
        expect(Size2d.min(a, b)).toEqual({ width: 4, height: 20 });
        expect(Size2d.max(a, b)).toEqual({ width: 10, height: 40 });
        expect(Size2d.min(a, undefined)).toBeUndefined();
    });

    it("compares field by field", () => {
        expect(Size2d.isSame(a, { ...a })).toBe(true);
        expect(Size2d.isSame(a, b)).toBe(false);
        expect(Size2d.isSame(a, undefined)).toBe(false);
    });

    it("round-trips through a string key", () => {
        expect(Size2d.toString(a)).toBe("WIDTH10_HEIGHT20");
        expect(Size2dString.fromString("WIDTH10_HEIGHT20")).toEqual(a);
        expect(Size2dString.fromString(Size2d.toString(b))).toEqual(b);
    });
});
