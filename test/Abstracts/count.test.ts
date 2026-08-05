import { describe, expect, it } from "vitest";

import { Count2d, Count2dString } from "../../src/Abstracts/count.js";

const a = { rows: 3, cols: 4 };
const b = { rows: 1, cols: 8 };

describe("Count2d", () => {
    it("does arithmetic under rows/cols", () => {
        expect(Count2d.add(a, b)).toEqual({ rows: 4, cols: 12 });
        expect(Count2d.sub(a, b)).toEqual({ rows: 2, cols: -4 });
        expect(Count2d.mul(a, b)).toEqual({ rows: 3, cols: 32 });
        expect(Count2d.div(a, b)).toEqual({ rows: 3, cols: 0.5 });
    });

    it("takes the smaller or larger of each tally", () => {
        expect(Count2d.min(a, b)).toEqual({ rows: 1, cols: 4 });
        expect(Count2d.max(a, b)).toEqual({ rows: 3, cols: 8 });
        expect(Count2d.max(undefined, b)).toBeUndefined();
    });

    it("compares field by field", () => {
        expect(Count2d.isSame(a, { ...a })).toBe(true);
        expect(Count2d.isSame(a, b)).toBe(false);
        expect(Count2d.isSame(undefined, undefined)).toBe(false);
    });

    it("round-trips through a string key", () => {
        expect(Count2d.toString(a)).toBe("ROWS3_COLS4");
        expect(Count2dString.fromString("ROWS3_COLS4")).toEqual(a);
    });
});
