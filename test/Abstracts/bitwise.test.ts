import { describe, expect, it } from "vitest";

import { BitwiseUtils } from "../../src/Abstracts/bitwise.js";

const READ = 1;
const WRITE = 2;
const EXEC = 4;

describe("BitwiseUtils.hasFlag", () => {
    it("finds a flag that is set", () => {
        expect(BitwiseUtils.hasFlag(READ | WRITE, READ)).toBe(true);
        expect(BitwiseUtils.hasFlag(READ | WRITE, WRITE)).toBe(true);
    });

    it("does not find a flag that is absent", () => {
        expect(BitwiseUtils.hasFlag(READ | WRITE, EXEC)).toBe(false);
        expect(BitwiseUtils.hasFlag(0, READ)).toBe(false);
    });
});

describe("BitwiseUtils.hasFlags", () => {
    it("requires every flag to be present", () => {
        expect(BitwiseUtils.hasFlags(READ | WRITE, [READ, WRITE])).toBe(true);
        expect(BitwiseUtils.hasFlags(READ | WRITE, [READ, EXEC])).toBe(false);
    });

    it("treats an empty list as satisfied", () => {
        expect(BitwiseUtils.hasFlags(0, [])).toBe(true);
    });
});

describe("BitwiseUtils.addFlags", () => {
    it("switches flags on without disturbing the rest", () => {
        expect(BitwiseUtils.addFlags(READ, [EXEC])).toBe(READ | EXEC);
    });

    it("is safe to apply twice", () => {
        const once = BitwiseUtils.addFlags(READ, [WRITE]);

        expect(BitwiseUtils.addFlags(once, [WRITE])).toBe(once);
    });

    it("returns the input unchanged for an empty list", () => {
        expect(BitwiseUtils.addFlags(READ | WRITE, [])).toBe(READ | WRITE);
    });
});

describe("BitwiseUtils.removeFlags", () => {
    it("switches flags off without disturbing the rest", () => {
        expect(BitwiseUtils.removeFlags(READ | WRITE | EXEC, [WRITE])).toBe(READ | EXEC);
    });

    it("is safe to apply twice", () => {
        const once = BitwiseUtils.removeFlags(READ | WRITE, [WRITE]);

        expect(BitwiseUtils.removeFlags(once, [WRITE])).toBe(once);
    });

    it("ignores flags that were never set", () => {
        expect(BitwiseUtils.removeFlags(READ, [EXEC])).toBe(READ);
    });
});
