const HOURS_PER_DAY = 24;
const HOURS_PER_HALF_DAY = 12;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR;
const SHORT_LENGTH = 5;
const LONG_LENGTH = 8;
const ISO_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const ANCHOR_YEAR = 2021;
const PAD = 2;

const wrap = (seconds: number) => ((seconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;

const pad = (value: number) => `${value}`.padStart(PAD, "0");

/**
 * A time of day on a 24-hour clock, with no date and no time zone attached.
 *
 * `second` is optional, and its presence is the value's **shape**: a field showing `09:30`
 * holds a value without it, one showing `09:30:00` holds a value with it set to zero. The
 * operations here carry that shape through rather than normalising it away, so a value does
 * not silently grow a seconds field it was never given.
 */
export type TimeValue = {
    hour: number;
    minute: number;
    second?: number;
};

/** Which part of a {@link TimeValue} an operation steps. */
export type TimeValueUnit = "hour" | "minute" | "second";

/** Which half of the day an hour falls in, for 12-hour readings. */
export type TimeValueMeridiem = "am" | "pm";

/** Reading, writing and stepping times of day. */
export namespace TimeUtils {
    /**
     * Flattens a time into how many seconds of the day have passed at that point.
     *
     * This is the common currency the comparisons run through, which is why values of
     * different shapes compare safely — a missing `second` counts as zero.
     *
     * @param value The time to flatten.
     * @returns A count from `0` to `86399` for a valid time.
     */
    export const getSecondOfDay = (value: TimeValue) =>
        value.hour * SECONDS_PER_HOUR + value.minute * SECONDS_PER_MINUTE + (value.second ?? 0);

    /**
     * Rebuilds a time from a count of seconds, wrapping around the day.
     *
     * Counts outside a single day wrap rather than overflow, so `-1` gives `23:59:59` and a
     * full day gives midnight. Fractions are rounded first.
     *
     * @param seconds How many seconds of the day have passed.
     * @param hasSeconds Whether the result should carry a `second` field. Left out, the shape
     * is guessed: seconds appear only when they are not zero. Pass it explicitly to keep a
     * value's existing shape, which is what {@link addUnit} does.
     * @returns The time that many seconds into the day.
     */
    export const fromSecondOfDay = (seconds: number, hasSeconds?: boolean): TimeValue => {
        const wrapped = wrap(Math.round(seconds));
        const second = wrapped % SECONDS_PER_MINUTE;

        return {
            hour: Math.floor(wrapped / SECONDS_PER_HOUR),
            minute: Math.floor((wrapped % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
            ...((hasSeconds ?? second !== 0) ? { second } : {}),
        };
    };

    /**
     * Tests whether two times point at the same moment of the day.
     *
     * Shape is ignored, so `09:30` and `09:30:00` match. Two missing values count as equal.
     *
     * @param a The first time, or nothing.
     * @param b The second time, or nothing.
     */
    export const isSame = (a: TimeValue | undefined, b: TimeValue | undefined) =>
        a === b || (!!a && !!b && getSecondOfDay(a) === getSecondOfDay(b));

    /**
     * Orders two times, in the shape `Array.prototype.sort` expects.
     *
     * @param a The first time.
     * @param b The second time.
     * @returns Negative if `a` comes first, `0` if they match, positive if `b` comes first.
     */
    export const compare = (a: TimeValue, b: TimeValue) => getSecondOfDay(a) - getSecondOfDay(b);

    /**
     * Pulls a time inside a range, leaving it alone if it already fits.
     *
     * @param value The time to pull in.
     * @param min The earliest allowed time, or nothing for no lower bound.
     * @param max The latest allowed time, or nothing for no upper bound.
     * @returns The value itself when it fits, otherwise whichever bound it overshot — returned
     * as given, not copied.
     */
    export const clamp = (value: TimeValue, min?: TimeValue, max?: TimeValue) => {
        if (min && compare(value, min) < 0) return min;
        if (max && compare(value, max) > 0) return max;

        return value;
    };

    /**
     * Tests whether a time falls inside a range, both ends included.
     *
     * @param value The time to test.
     * @param min The earliest allowed time, or nothing for no lower bound.
     * @param max The latest allowed time, or nothing for no upper bound.
     * @returns `true` when it fits. With neither bound given, everything fits.
     */
    export const getIsInRange = (value: TimeValue, min?: TimeValue, max?: TimeValue) =>
        (!min || compare(value, min) >= 0) && (!max || compare(value, max) <= 0);

    /**
     * Steps a time by whole units, carrying between them and wrapping around the day.
     *
     * Adding a minute to `09:59` gives `10:00`, and an hour to `23:30` gives `00:30` rather
     * than leaving the clock. The result keeps the shape of the input, so a value without a
     * seconds field does not gain one.
     *
     * @param value The time to step.
     * @param unit Which part to step.
     * @param delta How many units to move. Negative steps backwards.
     * @returns A new time. The input is not modified.
     */
    export const addUnit = (value: TimeValue, unit: TimeValueUnit, delta: number): TimeValue => {
        const step = unit === "hour" ? SECONDS_PER_HOUR : unit === "minute" ? SECONDS_PER_MINUTE : 1;

        return fromSecondOfDay(getSecondOfDay(value) + delta * step, value.second !== undefined);
    };

    /**
     * Reads which half of the day an hour falls in.
     *
     * One of the three conversions a 12-hour field needs, kept here rather than in the field
     * because they are the whole of what is easy to get wrong: **midnight reads as 12 am and
     * noon as 12 pm**, so the mapping is not `hour % 12` in either direction and no type
     * catches it. The value itself stays 24-hour — a meridiem is a way of reading an hour, not
     * a fourth field.
     *
     * @param value The time to read.
     * @returns `"am"` for midnight up to 11:59, `"pm"` from noon onwards.
     */
    export const getMeridiem = (value: TimeValue): TimeValueMeridiem => (value.hour < HOURS_PER_HALF_DAY ? "am" : "pm");

    /**
     * Reads the hour as a 12-hour clock shows it.
     *
     * @param value The time to read.
     * @returns A number from `1` to `12`. Both midnight and noon read as `12`, never `0`.
     */
    export const getTwelveHour = (value: TimeValue) => value.hour % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY;

    /**
     * Moves a time into the given half of the day, keeping the 12-hour reading of its hour.
     *
     * `09:30` made pm becomes `21:30`, and `00:05` made pm becomes `12:05` rather than `12:05`
     * being read as hour zero. Already being in the right half changes nothing, and the minute
     * and second are carried through untouched.
     *
     * @param value The time to move.
     * @param meridiem Which half of the day to land in.
     * @returns A new time. The input is not modified.
     */
    export const withMeridiem = (value: TimeValue, meridiem: TimeValueMeridiem): TimeValue => ({
        ...value,
        hour: (getTwelveHour(value) % HOURS_PER_HALF_DAY) + (meridiem === "pm" ? HOURS_PER_HALF_DAY : 0),
    });

    /**
     * Builds a time from the parts a 12-hour field holds.
     *
     * @param hour The hour as shown, from `1` to `12`.
     * @param minute The minute, from `0` to `59`.
     * @param meridiem Which half of the day the reading belongs to.
     * @param second The second, from `0` to `59`, or nothing to build a value without one.
     * @returns The 24-hour time those parts mean, so `12:30 am` is half past midnight, or
     * `undefined` if any part is outside its range.
     */
    export const fromTwelveHour = (
        hour: number,
        minute: number,
        meridiem: TimeValueMeridiem,
        second?: number,
    ): TimeValue | undefined => {
        if (hour < 1 || hour > HOURS_PER_HALF_DAY) return;
        if (minute < 0 || minute >= MINUTES_PER_HOUR) return;
        if (second !== undefined && (second < 0 || second >= SECONDS_PER_MINUTE)) return;

        const base = { hour: hour % HOURS_PER_HALF_DAY, minute, ...(second === undefined ? {} : { second }) };

        return withMeridiem(base, meridiem);
    };

    /**
     * Writes a time in 24-hour `HH:MM` or `HH:MM:SS` form.
     *
     * Which of the two you get follows the value's shape, so a value carrying a seconds field
     * writes seconds even when they are zero. Reverse it with {@link fromIso}.
     *
     * @param value The time to write.
     */
    export const toIso = (value: TimeValue) =>
        value.second === undefined
            ? `${pad(value.hour)}:${pad(value.minute)}`
            : `${pad(value.hour)}:${pad(value.minute)}:${pad(value.second)}`;

    /**
     * Reads a 24-hour `HH:MM` or `HH:MM:SS` string.
     *
     * Strict about spelling — both digits are required, so `9:30` is refused rather than
     * guessed at. A time that does not exist is refused rather than wrapped, so `24:00` gives
     * nothing instead of midnight. The shape of the result follows the text.
     *
     * @param text The string to read.
     * @returns The time, or `undefined` if the text is misshaped or out of range.
     */
    export const fromIso = (text: string): TimeValue | undefined => {
        if (text.length !== SHORT_LENGTH && text.length !== LONG_LENGTH) return;

        const parts = ISO_PATTERN.exec(text);

        if (!parts) return;

        const hour = Number(parts[1]);
        const minute = Number(parts[2]);
        const second = parts[3] === undefined ? undefined : Number(parts[3]);

        if (hour >= HOURS_PER_DAY || minute >= MINUTES_PER_HOUR) return;
        if (second !== undefined && second >= SECONDS_PER_MINUTE) return;

        return second === undefined ? { hour, minute } : { hour, minute, second };
    };

    /**
     * Writes the digits a 12-hour field shows, without the meridiem.
     *
     * The half of the day is deliberately left out — read it with {@link getMeridiem} and show
     * it however the field wants. So `13:05` writes as `01:05`, and midnight as `12:00`.
     *
     * @param value The time to write.
     */
    export const toTwelveHourText = (value: TimeValue) => toIso({ ...value, hour: getTwelveHour(value) });

    /**
     * Reads the digits a 12-hour field holds, with the meridiem supplied from outside.
     *
     * The 12-hour twin of {@link fromIso}: the same strictness about spelling, so `1:05` is
     * refused, and the same refusal of readings that do not exist — `13:00` and `00:30` are
     * not hours a 12-hour clock shows.
     *
     * @param text The digits, as `HH:MM` or `HH:MM:SS`.
     * @param meridiem Which half of the day the digits belong to.
     * @returns The 24-hour time, or `undefined` if the text is misshaped or out of range.
     */
    export const fromTwelveHourText = (text: string, meridiem: TimeValueMeridiem): TimeValue | undefined => {
        if (text.length !== SHORT_LENGTH && text.length !== LONG_LENGTH) return;

        const parts = ISO_PATTERN.exec(text);

        if (!parts) return;

        return fromTwelveHour(
            Number(parts[1]),
            Number(parts[2]),
            meridiem,
            parts[3] === undefined ? undefined : Number(parts[3]),
        );
    };

    /**
     * Formats a time for a human, through `Intl`.
     *
     * Whether the result reads as a 12- or 24-hour clock is the locale's business, not this
     * library's. The time is placed on a fixed arbitrary date first, since `Intl` formats
     * dates rather than bare times; that date is never shown.
     *
     * @param value The time to format.
     * @param options Passed straight to `Intl.DateTimeFormat`.
     * @param locale Which locale to format for, or the environment's own when left out.
     */
    export const format = (value: TimeValue, options?: Intl.DateTimeFormatOptions, locale?: string) =>
        new Intl.DateTimeFormat(locale, options).format(
            new Date(ANCHOR_YEAR, 0, 1, value.hour, value.minute, value.second ?? 0),
        );
}
