import { Size2d } from "./size.js";

export namespace MathUtils {
    /** How many radians make up one degree. Multiply a value in degrees by this to get radians. */
    export const RADIANS_PER_DEGREE = Math.PI / 180;

    /** How many degrees make up one radian. Multiply a value in radians by this to get degrees. */
    export const DEGREES_PER_RADIAN = 180 / Math.PI;

    /**
     * Tests whether a whole number is even.
     *
     * Uses a bit test, so the result is only meaningful for whole numbers within the
     * 32-bit range. Fractions are truncated before the test.
     */
    export const isEven = (value: number) => (value & 1) === 0;

    /**
     * Tests whether a whole number is odd.
     *
     * Uses a bit test, so the result is only meaningful for whole numbers within the
     * 32-bit range. Fractions are truncated before the test.
     */
    export const isOdd = (value: number) => (value & 1) === 1;

    /**
     * Adds up the results of calling a function once per index.
     *
     * @param f Called with each index from `0` to `times - 1`.
     * @param times How many times to call `f`. Zero or less produces `0`.
     * @returns The running total.
     */
    export const sumTimes = (f: (index: number) => number, times: number): number => {
        let sum = 0;
        for (let i = 0; i < times; i++) sum += f(i);
        return sum;
    };

    /**
     * Rounds a value down to the closest multiple of `near`.
     *
     * Rounds towards negative infinity, so negative values move further from zero:
     * `roundDownToNearestInt(-7, 5)` is `-10`. Values that are already an exact
     * multiple are returned unchanged.
     *
     * @param value The value to round.
     * @param near The multiple to snap to. Must not be `0`.
     */
    export const roundDownToNearestInt = (value: number, near: number): number => {
        return Math.floor(value / near) * near;
    };

    /**
     * Rounds a value up to the closest multiple of `near`.
     *
     * Rounds towards positive infinity. Values that are already an exact multiple are
     * returned unchanged, so `roundUpToNearestInt(10, 5)` is `10`, not `15`.
     *
     * @param value The value to round.
     * @param near The multiple to snap to. Must not be `0`.
     */
    export const roundUpToNearestInt = (value: number, near: number): number => {
        return Math.ceil(value / near) * near;
    };

    /**
     * Rounds a value to a fixed number of decimal places.
     *
     * Shifts the value using exponent notation rather than multiplying, which avoids
     * the usual floating-point drift: `roundToDecimalPlaces(1.005, 2)` gives `1.01`.
     *
     * @param value The value to round.
     * @param decimalPlaces How many digits to keep after the point. Defaults to `0`.
     */
    export const roundToDecimalPlaces = (value: number, decimalPlaces: number = 0): number => {
        const num = Math.round(Number(value + "e" + decimalPlaces));

        return Number(num + "e" + -decimalPlaces);
    };

    /**
     * Restricts a value to a range.
     *
     * Behaves exactly like `Math.min(Math.max(value, min), max)`, including when the bounds are given the
     * wrong way round — `clamp(1, 5, 3)` is `3`, because the upper bound is applied last. That equivalence is
     * deliberate rather than incidental: it is what makes replacing a hand-written clamp a change of spelling
     * rather than a change of behaviour.
     *
     * @param value The value to restrict.
     * @param min The lower bound.
     * @param max The upper bound.
     */
    export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    /**
     * Restricts a value to `0..1`.
     *
     * The same as `clamp(value, 0, 1)`, named because a ratio is what most callers are holding and
     * `clamp01(elapsed / duration)` says that where three arguments would bury it.
     *
     * @param value The value to restrict.
     */
    export const clamp01 = (value: number) => clamp(value, 0, 1);

    /**
     * Finds where a value sits between two others, as a ratio.
     *
     * The inverse of `lerp`, and its partner: `lerp(from, to, normalize(value, from, to))` returns `value`.
     * It does **not** clamp, so a value outside the range reports a ratio outside `0..1` — which is how a
     * caller can tell overshoot from a boundary. Wrap it in `clamp01` when that distinction is not wanted.
     *
     * A zero-width range has no meaningful answer and reports `0`. Callers wanting a different answer for
     * that case should say so themselves, because the right one is theirs rather than this function's: a
     * slider with no travel sits at the start, while a hold with no duration is already finished.
     *
     * @param value The value to locate.
     * @param from The value that maps to `0`.
     * @param to The value that maps to `1`.
     */
    export const normalize = (value: number, from: number, to: number) =>
        to === from ? 0 : (value - from) / (to - from);

    /**
     * Finds the value a given ratio of the way between two others.
     *
     * Does **not** clamp, so a ratio outside `0..1` extrapolates past the ends — which is what makes an
     * overshooting easing curve expressible. Wrap the ratio in `clamp01` when that is not wanted.
     *
     * Computed as `from + (to - from) * ratio` rather than `from * (1 - ratio) + to * ratio`: the first is
     * exact at `ratio` of `0` and drifts by a float at `1`, the second is exact at both ends and can
     * overshoot in between. Landing exactly on `from` matters more here, because `0` is where an animation
     * starts and where a value at rest sits.
     *
     * @param from The value at a ratio of `0`.
     * @param to The value at a ratio of `1`.
     * @param ratio How far between the two.
     */
    export const lerp = (from: number, to: number, ratio: number) => from + (to - from) * ratio;

    /**
     * Reverses the order of the lowest `bits` bits of a number.
     *
     * For example reversing `0b001` across 3 bits gives `0b100`. Bits above the given
     * width are discarded.
     *
     * @param n The value to reverse.
     * @param bits How many low bits take part.
     */
    export const reverseBits = (n: number, bits: number) => {
        let r = 0;

        for (let i = 0; i < bits; i++) {
            r = (r << 1) | ((n >> i) & 1);
        }

        return r;
    };

    /**
     * Produces an evenly spaced ladder of whole numbers from `from` to `to`.
     *
     * Every value except the last is rounded to a whole number, so this is meant for
     * pixel-style steps rather than exact fractions. The final entry is always exactly
     * `to`.
     *
     * @param from First value in the result.
     * @param to Last value in the result.
     * @param stepCount How many values to produce. Anything below `3` short-circuits to
     * just `[from, to]`.
     */
    export const getIntermediateValues = (from: number, to: number, stepCount: number) => {
        if (stepCount < 3) return [from, to];

        const stepSize = Math.abs(to - from) / (stepCount - 1);
        const values = Array.from({ length: stepCount - 1 }, (_, index) =>
            Math.round(from < to ? from + stepSize * index : from - stepSize * index),
        );

        values.push(to);

        return values;
    };

    /**
     * Converts an on-screen angle back into the angle you would need in an unscaled
     * box to point the same way.
     *
     * When a square is stretched into a rectangle, a line drawn at 45° no longer
     * *looks* like it sits at 45°. This undoes that distortion so the visual angle is
     * preserved.
     *
     * @param angle The angle as it should appear on screen, in degrees.
     * @param size The box the angle lives in. A zero width or height returns `angle`
     * untouched.
     * @returns The corrected angle in degrees, in the range -180 to 180.
     */
    export const unwarpAngle = (angle: number, size: Size2d): number => {
        if (size.width === 0 || size.height === 0) return angle;

        const radians = angle * RADIANS_PER_DEGREE;
        const visualX = Math.cos(radians);
        const visualY = Math.sin(radians);
        const boxX = visualX / size.height;
        const boxY = visualY / size.width;
        const unwarpedRadians = Math.atan2(boxY, boxX);

        return unwarpedRadians * DEGREES_PER_RADIAN;
    };
}
