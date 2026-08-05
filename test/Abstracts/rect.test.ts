import { describe, expect, it } from "vitest";

import { Rect, RectString, RectUtils } from "../../src/Abstracts/rect.js";

describe("Rect", () => {
    it("re-exports the shared four-number arithmetic", () => {
        const a = { x: 1, y: 2, width: 3, height: 4 };

        expect(Rect.add(a, a)).toEqual({ x: 2, y: 4, width: 6, height: 8 });
        expect(Rect.sub(a, a)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
        expect(Rect.spread(5)).toEqual({ x: 5, y: 5, width: 5, height: 5 });
        expect(Rect.isSame(a, { ...a })).toBe(true);
    });

    it("round-trips through a string key", () => {
        const rect = { x: 0, y: 0, width: 10, height: 20 };

        expect(Rect.toString(rect)).toBe("X0_Y0_WIDTH10_HEIGHT20");
        expect(RectString.fromString("X0_Y0_WIDTH10_HEIGHT20")).toEqual(rect);
    });
});

describe("RectUtils.fit", () => {
    it("scales to fit and centres the leftover room", () => {
        expect(RectUtils.fit({ width: 100, height: 50 }, { width: 200, height: 200 })).toEqual({
            x: 0,
            y: 50,
            width: 200,
            height: 100,
            scale: 2,
        });
    });

    it("scales down when the box is too big", () => {
        expect(RectUtils.fit({ width: 200, height: 200 }, { width: 100, height: 100 })).toEqual({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            scale: 0.5,
        });
    });

    it("centres horizontally when height is the limiting side", () => {
        expect(RectUtils.fit({ width: 50, height: 100 }, { width: 200, height: 200 })).toEqual({
            x: 50,
            y: 0,
            width: 100,
            height: 200,
            scale: 2,
        });
    });

    it("gives Infinity for a box with no area", () => {
        expect(RectUtils.fit({ width: 0, height: 0 }, { width: 100, height: 100 }).scale).toBe(Infinity);
    });
});

describe("RectUtils.getNormalizedBounds", () => {
    it("sorts corners into low and high edges", () => {
        expect(RectUtils.getNormalizedBounds({ x: 10, y: 10 }, { x: 0, y: 20 })).toEqual({
            minX: 0,
            maxX: 10,
            minY: 10,
            maxY: 20,
        });
    });

    it("gives the same answer whichever way round the corners come", () => {
        const a = { x: 3, y: 7 };
        const b = { x: 11, y: 2 };

        expect(RectUtils.getNormalizedBounds(a, b)).toEqual(RectUtils.getNormalizedBounds(b, a));
    });
});

describe("RectUtils.isPointInsideRect", () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };

    it("finds points within the rectangle", () => {
        expect(RectUtils.isPointInsideRect({ x: 5, y: 5 }, rect)).toBe(true);
    });

    it("counts points exactly on an edge as inside", () => {
        expect(RectUtils.isPointInsideRect({ x: 0, y: 0 }, rect)).toBe(true);
        expect(RectUtils.isPointInsideRect({ x: 10, y: 10 }, rect)).toBe(true);
        expect(RectUtils.isPointInsideRect({ x: 10, y: 5 }, rect)).toBe(true);
    });

    it("rejects points outside", () => {
        expect(RectUtils.isPointInsideRect({ x: -1, y: 5 }, rect)).toBe(false);
        expect(RectUtils.isPointInsideRect({ x: 5, y: 11 }, rect)).toBe(false);
    });
});

describe("RectUtils.hasAreaOverlap", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };

    it("finds a genuine overlap", () => {
        expect(RectUtils.hasAreaOverlap(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    });

    it("counts a shared edge as overlapping", () => {
        expect(RectUtils.hasAreaOverlap(a, { x: 10, y: 0, width: 5, height: 5 })).toBe(true);
    });

    it("rejects rectangles that are fully apart", () => {
        expect(RectUtils.hasAreaOverlap(a, { x: 20, y: 20, width: 5, height: 5 })).toBe(false);
    });

    it("is false if either rectangle is missing", () => {
        expect(RectUtils.hasAreaOverlap(undefined, a)).toBe(false);
        expect(RectUtils.hasAreaOverlap(a, undefined)).toBe(false);
    });
});

describe("RectUtils.hasAnyCornerInside", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };

    it("finds a corner sitting inside the other rectangle", () => {
        expect(RectUtils.hasAnyCornerInside(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    });

    it("works whichever rectangle contains the other", () => {
        expect(RectUtils.hasAnyCornerInside(a, { x: 2, y: 2, width: 2, height: 2 })).toBe(true);
        expect(RectUtils.hasAnyCornerInside({ x: 2, y: 2, width: 2, height: 2 }, a)).toBe(true);
    });

    it("is stricter than hasAreaOverlap for a plus shape", () => {
        // Two bars crossing: they share area, but no corner of either lands in the other.
        const horizontal = { x: 0, y: 4, width: 12, height: 4 };
        const vertical = { x: 4, y: 0, width: 4, height: 12 };

        expect(RectUtils.hasAreaOverlap(horizontal, vertical)).toBe(true);
        expect(RectUtils.hasAnyCornerInside(horizontal, vertical)).toBe(false);
    });

    it("is false if either rectangle is missing", () => {
        expect(RectUtils.hasAnyCornerInside(undefined, a)).toBe(false);
        expect(RectUtils.hasAnyCornerInside(a, undefined)).toBe(false);
    });
});
