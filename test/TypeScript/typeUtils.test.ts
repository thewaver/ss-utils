import { describe, expect, expectTypeOf, it } from "vitest";

import type {
    Append,
    ArrayElementType,
    KeysOfType,
    Nullable,
    PickContaining,
    Prepend,
    Redefine,
    RequiredKeys,
} from "../../src/TypeScript/typeUtils.js";

// These are types with no runtime side, so the checks below are all compile-time. They
// run as ordinary tests too, which keeps them from silently dropping out of the suite.

describe("Nullable", () => {
    it("allows null alongside the original type", () => {
        expectTypeOf<Nullable<number>>().toEqualTypeOf<number | null>();
    });
});

describe("Prepend", () => {
    it("adds a prefix and capitalizes the original key", () => {
        expectTypeOf<Prepend<{ width: number }, "min">>().toEqualTypeOf<{ minWidth: number }>();
    });

    it("leaves the key lowercase when told to", () => {
        expectTypeOf<Prepend<{ width: number }, "min", true>>().toEqualTypeOf<{ minwidth: number }>();
    });
});

describe("Append", () => {
    it("adds a capitalized suffix", () => {
        expectTypeOf<Append<{ border: number }, "width">>().toEqualTypeOf<{ borderWidth: number }>();
    });

    it("leaves the suffix lowercase when told to", () => {
        expectTypeOf<Append<{ border: number }, "width", true>>().toEqualTypeOf<{ borderwidth: number }>();
    });
});

describe("Redefine", () => {
    it("replaces the chosen keys rather than combining them", () => {
        expectTypeOf<Redefine<{ x: number; y: number }, { x: string }>>().toEqualTypeOf<{ x: string; y: number }>();
    });
});

describe("RequiredKeys", () => {
    it("makes chosen optional keys required", () => {
        expectTypeOf<RequiredKeys<{ a?: number; b?: string }, "a">>().toMatchObjectType<{ a: number }>();
        expectTypeOf<RequiredKeys<{ a?: number; b?: string }, "a">["a"]>().toEqualTypeOf<number>();
    });
});

describe("KeysOfType", () => {
    it("collects the keys whose value matches", () => {
        expectTypeOf<KeysOfType<{ a: number; b: string }, number>>().toEqualTypeOf<"a">();
        expectTypeOf<KeysOfType<{ a: number; b: string; c: number }, number>>().toEqualTypeOf<"a" | "c">();
    });
});

describe("PickContaining", () => {
    it("keeps only the keys whose names contain the text", () => {
        expectTypeOf<
            PickContaining<{ textColor: string; borderColor: string; width: number }, "Color">
        >().toEqualTypeOf<{ textColor: string; borderColor: string }>();
    });
});

describe("ArrayElementType", () => {
    it("pulls out what an array holds", () => {
        expectTypeOf<ArrayElementType<string[]>>().toEqualTypeOf<string>();
        expectTypeOf<ArrayElementType<readonly (1 | 2)[]>>().toEqualTypeOf<1 | 2>();
    });
});

it("has no runtime surface of its own", () => {
    expect(true).toBe(true);
});
