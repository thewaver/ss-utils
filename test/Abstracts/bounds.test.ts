import { describe, expect, it } from "vitest";

import { Bounds, BoundsString } from "../../src/Abstracts/bounds.js";

const a = { left: 0, top: 0, right: 10, bottom: 20 };
const b = { left: 5, top: 5, right: 5, bottom: 5 };

describe("Bounds", () => {
    it("does arithmetic in CSS inset order", () => {
        expect(Bounds.add(a, b)).toEqual({ left: 5, top: 5, right: 15, bottom: 25 });
        expect(Bounds.sub(a, b)).toEqual({ left: -5, top: -5, right: 5, bottom: 15 });
        expect(Bounds.mul(a, b)).toEqual({ left: 0, top: 0, right: 50, bottom: 100 });
        expect(Bounds.div(b, b)).toEqual({ left: 1, top: 1, right: 1, bottom: 1 });
    });

    it("takes the smaller or larger of each side", () => {
        expect(Bounds.min(a, b)).toEqual({ left: 0, top: 0, right: 5, bottom: 5 });
        expect(Bounds.max(a, b)).toEqual({ left: 5, top: 5, right: 10, bottom: 20 });
        expect(Bounds.min(a, undefined)).toBeUndefined();
    });

    it("spreads one distance onto all four sides", () => {
        expect(Bounds.spread(4)).toEqual({ left: 4, top: 4, right: 4, bottom: 4 });
        expect(Bounds.isSame(Bounds.spread(5), b)).toBe(true);
    });

    it("compares field by field", () => {
        expect(Bounds.isSame(a, { ...a })).toBe(true);
        expect(Bounds.isSame(a, b)).toBe(false);
    });

    it("round-trips through a string key", () => {
        expect(Bounds.toString(a)).toBe("LEFT0_TOP0_RIGHT10_BOTTOM20");
        expect(BoundsString.fromString("LEFT0_TOP0_RIGHT10_BOTTOM20")).toEqual(a);
    });
});
