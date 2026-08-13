import { describe, expect, it } from "vitest";

import { TimeUtils } from "../../src/Abstracts/time.js";

const LOCALE = "en-GB";

describe("getSecondOfDay and fromSecondOfDay", () => {
    it("counts the seconds elapsed at that point of the day", () => {
        expect(TimeUtils.getSecondOfDay({ hour: 0, minute: 0 })).toBe(0);
        expect(TimeUtils.getSecondOfDay({ hour: 9, minute: 30 })).toBe(34200);
        expect(TimeUtils.getSecondOfDay({ hour: 23, minute: 59, second: 59 })).toBe(86399);
    });

    it("counts a missing seconds field as zero", () => {
        expect(TimeUtils.getSecondOfDay({ hour: 9, minute: 30 })).toBe(
            TimeUtils.getSecondOfDay({ hour: 9, minute: 30, second: 0 }),
        );
    });

    it("wraps counts that fall outside the day", () => {
        expect(TimeUtils.fromSecondOfDay(-1)).toEqual({ hour: 23, minute: 59, second: 59 });
        expect(TimeUtils.fromSecondOfDay(86400)).toEqual({ hour: 0, minute: 0 });
        expect(TimeUtils.fromSecondOfDay(90061)).toEqual({ hour: 1, minute: 1, second: 1 });
    });

    it("rounds a fractional count before reading it", () => {
        expect(TimeUtils.fromSecondOfDay(90061.6)).toEqual({ hour: 1, minute: 1, second: 2 });
    });

    it("guesses the shape from whether the seconds are zero", () => {
        expect(TimeUtils.fromSecondOfDay(3600)).toEqual({ hour: 1, minute: 0 });
        expect(TimeUtils.fromSecondOfDay(3645)).toEqual({ hour: 1, minute: 0, second: 45 });
    });

    it("takes the shape it is told, over the guess", () => {
        expect(TimeUtils.fromSecondOfDay(3645, false)).toEqual({ hour: 1, minute: 0 });
        expect(TimeUtils.fromSecondOfDay(3600, true)).toEqual({ hour: 1, minute: 0, second: 0 });
    });

    it("round-trips a time through the count", () => {
        for (const value of [
            { hour: 0, minute: 0 },
            { hour: 9, minute: 30 },
            { hour: 23, minute: 59, second: 59 },
        ]) {
            expect(TimeUtils.fromSecondOfDay(TimeUtils.getSecondOfDay(value), value.second !== undefined)).toEqual(
                value,
            );
        }
    });
});

describe("fromIso", () => {
    it("reads both the short and the long form", () => {
        expect(TimeUtils.fromIso("09:30")).toEqual({ hour: 9, minute: 30 });
        expect(TimeUtils.fromIso("09:30:45")).toEqual({ hour: 9, minute: 30, second: 45 });
        expect(TimeUtils.fromIso("00:00")).toEqual({ hour: 0, minute: 0 });
        expect(TimeUtils.fromIso("23:59")).toEqual({ hour: 23, minute: 59 });
    });

    it("refuses a time that does not exist rather than wrapping it", () => {
        expect(TimeUtils.fromIso("24:00")).toBe(undefined);
        expect(TimeUtils.fromIso("09:60")).toBe(undefined);
        expect(TimeUtils.fromIso("09:30:60")).toBe(undefined);
    });

    it("refuses anything incomplete or misshaped", () => {
        expect(TimeUtils.fromIso("9:30")).toBe(undefined);
        expect(TimeUtils.fromIso("09:3")).toBe(undefined);
        expect(TimeUtils.fromIso("0930")).toBe(undefined);
        expect(TimeUtils.fromIso("")).toBe(undefined);
        expect(TimeUtils.fromIso("aa:bb")).toBe(undefined);
    });

    it("round-trips through toIso, keeping the shape it was given", () => {
        expect(TimeUtils.toIso({ hour: 9, minute: 5 })).toBe("09:05");
        expect(TimeUtils.toIso({ hour: 9, minute: 5, second: 7 })).toBe("09:05:07");
        expect(TimeUtils.fromIso(TimeUtils.toIso({ hour: 23, minute: 59, second: 59 }))).toEqual({
            hour: 23,
            minute: 59,
            second: 59,
        });
    });
});

describe("addUnit", () => {
    it("steps one unit at a time", () => {
        expect(TimeUtils.addUnit({ hour: 9, minute: 30 }, "hour", 1)).toEqual({ hour: 10, minute: 30 });
        expect(TimeUtils.addUnit({ hour: 9, minute: 30 }, "minute", -1)).toEqual({ hour: 9, minute: 29 });
        expect(TimeUtils.addUnit({ hour: 9, minute: 30, second: 0 }, "second", 5)).toEqual({
            hour: 9,
            minute: 30,
            second: 5,
        });
    });

    it("carries between units", () => {
        expect(TimeUtils.addUnit({ hour: 9, minute: 59 }, "minute", 1)).toEqual({ hour: 10, minute: 0 });
        expect(TimeUtils.addUnit({ hour: 9, minute: 0 }, "minute", -1)).toEqual({ hour: 8, minute: 59 });
    });

    it("wraps around the day rather than leaving the clock", () => {
        expect(TimeUtils.addUnit({ hour: 23, minute: 30 }, "hour", 1)).toEqual({ hour: 0, minute: 30 });
        expect(TimeUtils.addUnit({ hour: 0, minute: 0 }, "minute", -1)).toEqual({ hour: 23, minute: 59 });
        expect(TimeUtils.addUnit({ hour: 0, minute: 0 }, "hour", -25)).toEqual({ hour: 23, minute: 0 });
    });

    it("keeps seconds only when the value already had them", () => {
        expect(TimeUtils.addUnit({ hour: 9, minute: 30 }, "hour", 1).second).toBe(undefined);
        expect(TimeUtils.addUnit({ hour: 9, minute: 30, second: 0 }, "hour", 1).second).toBe(0);
    });
});

describe("compare, clamp and getIsInRange", () => {
    it("orders by the second of the day, so shapes mix safely", () => {
        expect(TimeUtils.compare({ hour: 9, minute: 0 }, { hour: 9, minute: 0, second: 0 })).toBe(0);
        expect(TimeUtils.isSame({ hour: 9, minute: 0 }, { hour: 9, minute: 0, second: 0 })).toBe(true);
        expect(TimeUtils.compare({ hour: 9, minute: 0 }, { hour: 9, minute: 1 })).toBeLessThan(0);
    });

    it("pulls a time into the range and reports which side it was on", () => {
        const min = { hour: 9, minute: 0 };
        const max = { hour: 17, minute: 0 };

        expect(TimeUtils.clamp({ hour: 8, minute: 0 }, min, max)).toEqual(min);
        expect(TimeUtils.clamp({ hour: 18, minute: 0 }, min, max)).toEqual(max);
        expect(TimeUtils.getIsInRange({ hour: 9, minute: 0 }, min, max)).toBe(true);
        expect(TimeUtils.getIsInRange({ hour: 8, minute: 59 }, min, max)).toBe(false);
    });

    it("leaves a time that already fits alone", () => {
        const value = { hour: 12, minute: 0 };

        expect(TimeUtils.clamp(value, { hour: 9, minute: 0 }, { hour: 17, minute: 0 })).toBe(value);
    });

    it("treats a missing bound as no bound on that side", () => {
        expect(TimeUtils.clamp({ hour: 8, minute: 0 }, { hour: 9, minute: 0 })).toEqual({ hour: 9, minute: 0 });
        expect(TimeUtils.clamp({ hour: 23, minute: 0 }, { hour: 9, minute: 0 })).toEqual({ hour: 23, minute: 0 });
        expect(TimeUtils.clamp({ hour: 23, minute: 0 }, undefined, { hour: 17, minute: 0 })).toEqual({
            hour: 17,
            minute: 0,
        });
        expect(TimeUtils.getIsInRange({ hour: 3, minute: 0 })).toBe(true);
    });

    it("counts both ends of the range as inside it", () => {
        expect(TimeUtils.getIsInRange({ hour: 17, minute: 0 }, { hour: 9, minute: 0 }, { hour: 17, minute: 0 })).toBe(
            true,
        );
    });

    it("has an opinion about missing values only when both are missing", () => {
        expect(TimeUtils.isSame(undefined, undefined)).toBe(true);
        expect(TimeUtils.isSame({ hour: 1, minute: 0 }, undefined)).toBe(false);
        expect(TimeUtils.isSame(undefined, { hour: 1, minute: 0 })).toBe(false);
    });
});

describe("format", () => {
    it("goes through Intl, so the clock convention is the locale's", () => {
        expect(TimeUtils.format({ hour: 13, minute: 5 }, { hour: "2-digit", minute: "2-digit" }, LOCALE)).toBe("13:05");
        expect(TimeUtils.format({ hour: 13, minute: 5 }, { hour: "numeric", minute: "2-digit" }, "en-US")).toBe(
            "1:05 PM",
        );
    });
});

describe("the twelve-hour reading", () => {
    it("reads midnight as 12 am and noon as 12 pm, which is where the off-by-twelve lives", () => {
        expect(TimeUtils.getTwelveHour({ hour: 0, minute: 0 }), "midnight is the twelfth hour, not the zeroth").toBe(
            12,
        );
        expect(TimeUtils.getMeridiem({ hour: 0, minute: 0 })).toBe("am");
        expect(TimeUtils.getTwelveHour({ hour: 12, minute: 0 })).toBe(12);
        expect(TimeUtils.getMeridiem({ hour: 12, minute: 0 }), "noon is pm, not am").toBe("pm");
    });

    it("reads the ordinary hours the ordinary way", () => {
        expect(TimeUtils.getTwelveHour({ hour: 9, minute: 30 })).toBe(9);
        expect(TimeUtils.getMeridiem({ hour: 9, minute: 30 })).toBe("am");
        expect(TimeUtils.getTwelveHour({ hour: 13, minute: 30 })).toBe(1);
        expect(TimeUtils.getMeridiem({ hour: 13, minute: 30 })).toBe("pm");
        expect(TimeUtils.getTwelveHour({ hour: 23, minute: 59 })).toBe(11);
    });

    it("moves an hour between halves of the day without touching the rest of it", () => {
        expect(TimeUtils.withMeridiem({ hour: 9, minute: 30 }, "pm")).toEqual({ hour: 21, minute: 30 });
        expect(TimeUtils.withMeridiem({ hour: 21, minute: 30 }, "am")).toEqual({ hour: 9, minute: 30 });
        expect(TimeUtils.withMeridiem({ hour: 0, minute: 5 }, "pm"), "12 am becomes 12 pm").toEqual({
            hour: 12,
            minute: 5,
        });
        expect(TimeUtils.withMeridiem({ hour: 12, minute: 5 }, "am"), "and back again").toEqual({
            hour: 0,
            minute: 5,
        });
    });

    it("is idempotent when the half of the day already matches", () => {
        expect(TimeUtils.withMeridiem({ hour: 13, minute: 0 }, "pm")).toEqual({ hour: 13, minute: 0 });
        expect(TimeUtils.withMeridiem({ hour: 1, minute: 0 }, "am")).toEqual({ hour: 1, minute: 0 });
    });

    it("keeps seconds through the conversion, and only when they were there", () => {
        expect(TimeUtils.withMeridiem({ hour: 9, minute: 30, second: 15 }, "pm")).toEqual({
            hour: 21,
            minute: 30,
            second: 15,
        });
        expect(TimeUtils.withMeridiem({ hour: 9, minute: 30 }, "pm")).not.toHaveProperty("second");
    });

    it("refuses a twelve-hour reading that is not one", () => {
        expect(TimeUtils.fromTwelveHour(0, 30, "am"), "there is no zeroth hour on a 12-hour clock").toBeUndefined();
        expect(TimeUtils.fromTwelveHour(13, 30, "pm"), "nor a thirteenth").toBeUndefined();
        expect(TimeUtils.fromTwelveHour(9, 60, "am"), "nor a sixtieth minute").toBeUndefined();
        expect(TimeUtils.fromTwelveHour(9, 30, "am", 60)).toBeUndefined();
    });

    it("refuses a part below its range as firmly as one above it", () => {
        expect(TimeUtils.fromTwelveHour(9, -5, "am")).toBeUndefined();
        expect(TimeUtils.fromTwelveHour(9, 30, "am", -5)).toBeUndefined();
    });

    it("builds the value the field means from the digits and the half of the day", () => {
        expect(TimeUtils.fromTwelveHour(12, 30, "am"), "12:30 am is half past midnight").toEqual({
            hour: 0,
            minute: 30,
        });
        expect(TimeUtils.fromTwelveHour(12, 30, "pm"), "12:30 pm is half past noon").toEqual({
            hour: 12,
            minute: 30,
        });
        expect(TimeUtils.fromTwelveHour(1, 5, "pm")).toEqual({ hour: 13, minute: 5 });
        expect(TimeUtils.fromTwelveHour(11, 45, "am", 30)).toEqual({ hour: 11, minute: 45, second: 30 });
    });
});

describe("the twelve-hour text form", () => {
    it("writes the digits a field shows, leaving the half of the day out", () => {
        expect(TimeUtils.toTwelveHourText({ hour: 13, minute: 5 })).toBe("01:05");
        expect(TimeUtils.toTwelveHourText({ hour: 0, minute: 5 }), "midnight shows as twelve").toBe("12:05");
        expect(TimeUtils.toTwelveHourText({ hour: 12, minute: 0 }), "and so does noon").toBe("12:00");
        expect(TimeUtils.toTwelveHourText({ hour: 13, minute: 5, second: 7 })).toBe("01:05:07");
    });

    it("reads those digits back given the half of the day", () => {
        expect(TimeUtils.fromTwelveHourText("01:05", "pm")).toEqual({ hour: 13, minute: 5 });
        expect(TimeUtils.fromTwelveHourText("12:30", "am")).toEqual({ hour: 0, minute: 30 });
        expect(TimeUtils.fromTwelveHourText("12:30", "pm")).toEqual({ hour: 12, minute: 30 });
        expect(TimeUtils.fromTwelveHourText("11:45:30", "am")).toEqual({ hour: 11, minute: 45, second: 30 });
    });

    it("refuses a reading a twelve-hour clock never shows", () => {
        expect(TimeUtils.fromTwelveHourText("13:00", "pm")).toBeUndefined();
        expect(TimeUtils.fromTwelveHourText("00:30", "am")).toBeUndefined();
    });

    it("is as strict about spelling as fromIso", () => {
        expect(TimeUtils.fromTwelveHourText("1:05", "pm")).toBeUndefined();
        expect(TimeUtils.fromTwelveHourText("0105", "pm")).toBeUndefined();
        expect(TimeUtils.fromTwelveHourText("", "pm")).toBeUndefined();
    });

    it("round-trips a time through the text and the meridiem", () => {
        for (const value of [
            { hour: 0, minute: 30 },
            { hour: 9, minute: 5 },
            { hour: 12, minute: 0 },
            { hour: 13, minute: 5, second: 7 },
            { hour: 23, minute: 59, second: 59 },
        ]) {
            const text = TimeUtils.toTwelveHourText(value);

            expect(TimeUtils.fromTwelveHourText(text, TimeUtils.getMeridiem(value)), text).toEqual(value);
        }
    });
});
