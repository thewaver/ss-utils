import { describe, expect, it } from "vitest";

import { MathUtils } from "../../src/Abstracts/math.js";

describe("MathUtils.isEven / isOdd", () => {
    it("classifies whole numbers", () => {
        expect(MathUtils.isEven(0)).toBe(true);
        expect(MathUtils.isEven(2)).toBe(true);
        expect(MathUtils.isEven(3)).toBe(false);
        expect(MathUtils.isOdd(3)).toBe(true);
        expect(MathUtils.isOdd(-3)).toBe(true);
        expect(MathUtils.isOdd(4)).toBe(false);
    });

    it("truncates fractions before testing", () => {
        expect(MathUtils.isEven(2.7)).toBe(true);
        expect(MathUtils.isOdd(3.9)).toBe(true);
    });
});

describe("MathUtils.sumTimes", () => {
    it("adds up one call per index", () => {
        expect(MathUtils.sumTimes((i) => i, 4)).toBe(6);
        expect(MathUtils.sumTimes(() => 2, 3)).toBe(6);
    });

    it("produces 0 for zero or fewer times", () => {
        expect(MathUtils.sumTimes((i) => i, 0)).toBe(0);
        expect(MathUtils.sumTimes((i) => i, -5)).toBe(0);
    });
});

describe("MathUtils.roundDownToNearestInt", () => {
    it("snaps down to a multiple", () => {
        expect(MathUtils.roundDownToNearestInt(7, 5)).toBe(5);
        expect(MathUtils.roundDownToNearestInt(10, 5)).toBe(10);
    });

    it("rounds towards negative infinity", () => {
        expect(MathUtils.roundDownToNearestInt(-7, 5)).toBe(-10);
    });
});

describe("MathUtils.roundUpToNearestInt", () => {
    it("snaps up to a multiple", () => {
        expect(MathUtils.roundUpToNearestInt(7, 5)).toBe(10);
    });

    it("leaves exact multiples alone", () => {
        expect(MathUtils.roundUpToNearestInt(10, 5)).toBe(10);
    });

    it("rounds towards positive infinity", () => {
        expect(MathUtils.roundUpToNearestInt(-7, 5)).toBe(-5);
    });
});

describe("MathUtils.roundToDecimalPlaces", () => {
    it("keeps the requested number of digits", () => {
        expect(MathUtils.roundToDecimalPlaces(1.2345, 2)).toBe(1.23);
        expect(MathUtils.roundToDecimalPlaces(1.2355, 3)).toBe(1.236);
    });

    it("defaults to whole numbers", () => {
        expect(MathUtils.roundToDecimalPlaces(2.5)).toBe(3);
        expect(MathUtils.roundToDecimalPlaces(2.4)).toBe(2);
    });

    it("sidesteps the usual floating-point drift", () => {
        // 1.005 * 100 is 100.49999999999999 in binary floating point, so a naive
        // multiply-and-round gives 1.00 here.
        expect(MathUtils.roundToDecimalPlaces(1.005, 2)).toBe(1.01);
    });
});

describe("MathUtils.reverseBits", () => {
    it("flips the low bits end for end", () => {
        expect(MathUtils.reverseBits(0b001, 3)).toBe(0b100);
        expect(MathUtils.reverseBits(0b110, 3)).toBe(0b011);
        expect(MathUtils.reverseBits(0b1010, 4)).toBe(0b0101);
    });

    it("discards bits above the given width", () => {
        expect(MathUtils.reverseBits(0b111, 1)).toBe(0b1);
        expect(MathUtils.reverseBits(0b100, 2)).toBe(0);
    });
});

describe("MathUtils.getIntermediateValues", () => {
    it("short-circuits below three steps", () => {
        expect(MathUtils.getIntermediateValues(5, 1, 2)).toEqual([5, 1]);
        expect(MathUtils.getIntermediateValues(5, 1, 0)).toEqual([5, 1]);
    });

    it("spaces values evenly and lands exactly on the end", () => {
        expect(MathUtils.getIntermediateValues(0, 10, 5)).toEqual([0, 3, 5, 8, 10]);
    });

    it("counts downwards when the range is reversed", () => {
        expect(MathUtils.getIntermediateValues(10, 0, 5)).toEqual([10, 8, 5, 3, 0]);
    });
});

describe("MathUtils.unwarpAngle", () => {
    it("leaves an angle alone in a square box", () => {
        expect(MathUtils.unwarpAngle(45, { width: 100, height: 100 })).toBeCloseTo(45, 10);
    });

    it("returns the angle untouched when the box has no area", () => {
        expect(MathUtils.unwarpAngle(45, { width: 0, height: 10 })).toBe(45);
        expect(MathUtils.unwarpAngle(45, { width: 10, height: 0 })).toBe(45);
    });

    it("corrects for a stretched box", () => {
        // Twice as wide as it is tall, so a line that should look like 45 degrees has to
        // be drawn shallower than that in the box's own coordinates.
        expect(MathUtils.unwarpAngle(45, { width: 200, height: 100 })).toBeCloseTo(26.5651, 3);
    });

    it("keeps results within -180 to 180", () => {
        for (const angle of [-170, -45, 0, 45, 170]) {
            const result = MathUtils.unwarpAngle(angle, { width: 300, height: 50 });

            expect(result).toBeGreaterThanOrEqual(-180);
            expect(result).toBeLessThanOrEqual(180);
        }
    });
});
