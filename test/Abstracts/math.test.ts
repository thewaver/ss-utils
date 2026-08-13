import { describe, expect, it } from "vitest";

import { MathUtils } from "../../src/Abstracts/math.js";

describe("MathUtils.RADIANS_PER_DEGREE / DEGREES_PER_RADIAN", () => {
    it("converts the landmark angles", () => {
        expect(180 * MathUtils.RADIANS_PER_DEGREE).toBeCloseTo(Math.PI, 10);
        expect(90 * MathUtils.RADIANS_PER_DEGREE).toBeCloseTo(Math.PI / 2, 10);
        expect(Math.PI * MathUtils.DEGREES_PER_RADIAN).toBeCloseTo(180, 10);
    });

    it("undoes itself when applied both ways", () => {
        expect(37 * MathUtils.RADIANS_PER_DEGREE * MathUtils.DEGREES_PER_RADIAN).toBeCloseTo(37, 10);
    });
});

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

describe("MathUtils.clamp", () => {
    it("passes a value inside the range through untouched", () => {
        expect(MathUtils.clamp(5, 0, 10)).toBe(5);
    });

    it("stops at whichever bound the value passed", () => {
        expect(MathUtils.clamp(-1, 0, 10)).toBe(0);
        expect(MathUtils.clamp(11, 0, 10)).toBe(10);
    });

    it("applies the upper bound last, so inverted bounds resolve to the upper one", () => {
        expect(MathUtils.clamp(1, 5, 3)).toBe(3);
    });

    it("matches the hand-written form it replaces, which is the whole point", () => {
        for (const [value, min, max] of [
            [5, 0, 10],
            [-1, 0, 10],
            [11, 0, 10],
            [1, 5, 3],
            [0, 0, 0],
        ]) {
            expect(MathUtils.clamp(value, min, max), `${value} in ${min}..${max}`).toBe(
                Math.min(Math.max(value, min), max),
            );
        }
    });
});

describe("MathUtils.clamp01", () => {
    it("is the 0..1 case of clamp", () => {
        expect(MathUtils.clamp01(-0.5)).toBe(0);
        expect(MathUtils.clamp01(0.25)).toBe(0.25);
        expect(MathUtils.clamp01(2)).toBe(1);
    });
});

describe("MathUtils.normalize", () => {
    it("reports where a value sits between two others", () => {
        expect(MathUtils.normalize(5, 0, 10)).toBe(0.5);
        expect(MathUtils.normalize(0, 0, 10)).toBe(0);
        expect(MathUtils.normalize(10, 0, 10)).toBe(1);
    });

    it("reads a descending range as readily as an ascending one", () => {
        expect(MathUtils.normalize(75, 100, 50)).toBe(0.5);
    });

    it("reports overshoot rather than hiding it, which is what keeps it separate from clamping", () => {
        expect(MathUtils.normalize(20, 0, 10)).toBe(2);
        expect(MathUtils.normalize(-10, 0, 10)).toBe(-1);
    });

    it("answers a zero-width range with 0 rather than a division by zero", () => {
        expect(MathUtils.normalize(5, 3, 3)).toBe(0);
    });
});

describe("MathUtils.lerp", () => {
    it("walks from one value to the other", () => {
        expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
        expect(MathUtils.lerp(10, 20, 0.25)).toBe(12.5);
    });

    it("lands exactly on both ends", () => {
        expect(MathUtils.lerp(0.1, 0.3, 0)).toBe(0.1);
        expect(MathUtils.lerp(0.1, 0.3, 1)).toBe(0.3);
    });

    it("extrapolates past the ends, which is what an overshooting curve needs", () => {
        expect(MathUtils.lerp(0, 10, 1.5)).toBe(15);
        expect(MathUtils.lerp(0, 10, -0.5)).toBe(-5);
    });

    it("undoes normalize, and is undone by it", () => {
        expect(MathUtils.lerp(20, 80, MathUtils.normalize(50, 20, 80))).toBe(50);
        expect(MathUtils.normalize(MathUtils.lerp(20, 80, 0.25), 20, 80)).toBe(0.25);
    });
});
