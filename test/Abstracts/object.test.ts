import { describe, expect, it, vi } from "vitest";

import { EMPTY_ARRAY, EMPTY_OBJECT, ObjectUtils } from "../../src/Abstracts/object.js";

describe("EMPTY_ARRAY / EMPTY_OBJECT", () => {
    it("are empty and keep a stable reference", () => {
        expect(EMPTY_ARRAY).toHaveLength(0);
        expect(Object.keys(EMPTY_OBJECT)).toHaveLength(0);
        expect(EMPTY_ARRAY).toBe(EMPTY_ARRAY);
    });
});

describe("ObjectUtils.sameIfEmpty", () => {
    it("treats any two empty values as equal", () => {
        expect(ObjectUtils.sameIfEmpty({}, {})).toBe(true);
        expect(ObjectUtils.sameIfEmpty([], [])).toBe(true);
    });

    it("compares non-empty values by reference", () => {
        const obj = { a: 1 };

        expect(ObjectUtils.sameIfEmpty(obj, obj)).toBe(true);
        expect(ObjectUtils.sameIfEmpty({ a: 1 }, { a: 1 })).toBe(false);
    });

    it("counts the two sides together, so one empty side is not enough", () => {
        expect(ObjectUtils.sameIfEmpty({}, { a: 1 })).toBe(false);
    });
});

describe("ObjectUtils.onlyDefinedProps", () => {
    it("drops undefined values but keeps null", () => {
        expect(ObjectUtils.onlyDefinedProps({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
    });

    it("does not modify the input", () => {
        const input = { a: 1, b: undefined };

        ObjectUtils.onlyDefinedProps(input);

        expect(Object.keys(input)).toEqual(["a", "b"]);
    });
});

describe("ObjectUtils.getRandomArrayValues", () => {
    it("never draws the same entry twice", () => {
        const source = [1, 2, 3, 4, 5];
        const drawn = ObjectUtils.getRandomArrayValues(source, 5);

        expect([...drawn].sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it("draws one entry by default", () => {
        expect(ObjectUtils.getRandomArrayValues([1, 2, 3])).toHaveLength(1);
    });

    it("clamps the count to what exists, and to at least one", () => {
        expect(ObjectUtils.getRandomArrayValues([1, 2], 10)).toHaveLength(2);
        expect(ObjectUtils.getRandomArrayValues([1, 2], 0)).toHaveLength(1);
    });

    it("does not modify the input", () => {
        const source = [1, 2, 3];

        ObjectUtils.getRandomArrayValues(source, 3);

        expect(source).toEqual([1, 2, 3]);
    });

    it("gives an empty result for an empty source", () => {
        expect(ObjectUtils.getRandomArrayValues([], 3)).toEqual([]);
    });
});

describe("ObjectUtils.getRandomRecordValues", () => {
    it("draws from the object's values", () => {
        const drawn = ObjectUtils.getRandomRecordValues({ a: 1, b: 2, c: 3 }, 3);

        expect([...drawn].sort()).toEqual([1, 2, 3]);
    });
});

describe("ObjectUtils.mapifyArray", () => {
    it("indexes by the chosen field", () => {
        const arr = [
            { id: "a", value: 1 },
            { id: "b", value: 2 },
        ];

        expect(ObjectUtils.mapifyArray(arr, "id")).toEqual({
            a: { id: "a", value: 1 },
            b: { id: "b", value: 2 },
        });
    });

    it("lets the later entry win on a duplicate key", () => {
        const arr = [
            { id: "a", value: 1 },
            { id: "a", value: 3 },
        ];

        expect(ObjectUtils.mapifyArray(arr, "id")).toEqual({ a: { id: "a", value: 3 } });
    });
});

describe("ObjectUtils.excludeNull", () => {
    it("drops null and undefined but keeps other falsy values", () => {
        expect(ObjectUtils.excludeNull([1, null, 2, undefined, 0, ""])).toEqual([1, 2, 0, ""]);
    });

    it("does not modify the input", () => {
        const input = [1, null];

        ObjectUtils.excludeNull(input);

        expect(input).toEqual([1, null]);
    });
});

describe("ObjectUtils.multiplyNumberKeys", () => {
    it("scales numbers and leaves everything else alone", () => {
        expect(ObjectUtils.multiplyNumberKeys({ a: 2, b: "x", c: true }, 3)).toEqual({ a: 6, b: "x", c: true });
    });

    it("does not modify the input", () => {
        const input = { a: 2 };

        expect(ObjectUtils.multiplyNumberKeys(input, 3)).not.toBe(input);
        expect(input.a).toBe(2);
    });
});

describe("ObjectUtils.filterInPlace", () => {
    it("filters the array it is given and returns the same instance", () => {
        const arr = [1, 2, 3, 4, 5];

        expect(ObjectUtils.filterInPlace(arr, (e) => e % 2 === 1)).toBe(arr);
        expect(arr).toEqual([1, 3, 5]);
    });

    it("passes the index and the array to the condition", () => {
        const condition = vi.fn(() => true);
        const arr = ["a", "b"];

        ObjectUtils.filterInPlace(arr, condition);

        expect(condition).toHaveBeenCalledWith("a", 0, arr);
        expect(condition).toHaveBeenCalledWith("b", 1, arr);
    });

    it("can empty the array entirely", () => {
        const arr = [1, 2, 3];

        ObjectUtils.filterInPlace(arr, () => false);

        expect(arr).toEqual([]);
    });
});

describe("ObjectUtils.getPrevArrayElement / getNextArrayElement", () => {
    const keys = ["a", "b", "c"];

    it("steps without wrapping", () => {
        expect(ObjectUtils.getPrevArrayElement("b", keys)).toBe("a");
        expect(ObjectUtils.getNextArrayElement("b", keys)).toBe("c");
    });

    it("runs off the end rather than wrapping", () => {
        expect(ObjectUtils.getPrevArrayElement("a", keys)).toBeUndefined();
        expect(ObjectUtils.getNextArrayElement("c", keys)).toBeUndefined();
    });

    it("starts from the far end when there is no current entry", () => {
        expect(ObjectUtils.getPrevArrayElement(undefined, keys)).toBe("c");
        expect(ObjectUtils.getNextArrayElement(undefined, keys)).toBe("a");
    });
});

describe("ObjectUtils.getPrevArrayIndex / getNextArrayIndex", () => {
    it("steps within range", () => {
        expect(ObjectUtils.getPrevArrayIndex(2, 3)).toBe(1);
        expect(ObjectUtils.getNextArrayIndex(0, 3)).toBe(1);
    });

    it("wraps around the ends", () => {
        expect(ObjectUtils.getPrevArrayIndex(0, 3)).toBe(2);
        expect(ObjectUtils.getNextArrayIndex(2, 3)).toBe(0);
    });
});

describe("ObjectUtils.padArray", () => {
    it("extends by repeating the last entry", () => {
        expect(ObjectUtils.padArray([1, 2], 0, 4)).toEqual([1, 2, 2, 2]);
    });

    it("cuts long arrays off", () => {
        expect(ObjectUtils.padArray([1, 2, 3], 0, 2)).toEqual([1, 2]);
    });

    it("falls back to the default for an empty or missing array", () => {
        expect(ObjectUtils.padArray([], 9, 3)).toEqual([9, 9, 9]);
        expect(ObjectUtils.padArray(undefined, 9, 2)).toEqual([9, 9]);
    });

    it("does not modify the input", () => {
        const input = [1];

        expect(ObjectUtils.padArray(input, 0, 3)).not.toBe(input);
        expect(input).toEqual([1]);
    });
});

describe("ObjectUtils.zipArray", () => {
    it("truncates to the shortest array", () => {
        expect(ObjectUtils.zipArray("truncate", [1, 2, 3], ["a", "b"])).toEqual([
            [1, "a"],
            [2, "b"],
        ]);
    });

    it("stretches shorter arrays to the longest", () => {
        expect(ObjectUtils.zipArray("stretch", [1, 2], ["a", "b", "c", "d"])).toEqual([
            [1, "a"],
            [1, "b"],
            [2, "c"],
            [2, "d"],
        ]);
    });

    it("gives an empty result when handed no arrays", () => {
        expect(ObjectUtils.zipArray("truncate")).toEqual([]);
    });

    it("handles a single array", () => {
        expect(ObjectUtils.zipArray("truncate", [1, 2])).toEqual([[1], [2]]);
    });
});
