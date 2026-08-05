import { describe, expect, expectTypeOf, it } from "vitest";

import type { Dir, Dir2d } from "../../src/Abstracts/dir.js";

// `dir.ts` is types only, so these checks are compile-time. They run as ordinary tests
// too, which keeps them from silently dropping out of the suite.

describe("Dir", () => {
    it("allows only back, forward and at rest", () => {
        expectTypeOf<Dir>().toEqualTypeOf<-1 | 0 | 1>();
    });

    it("accepts each of the three values", () => {
        const values: Dir[] = [-1, 0, 1];

        expect(values).toHaveLength(3);
    });
});

describe("Dir2d", () => {
    it("keeps the two axes independent", () => {
        expectTypeOf<Dir2d>().toEqualTypeOf<{ x: Dir; y: Dir }>();
        expectTypeOf<Dir2d["x"]>().toEqualTypeOf<Dir>();
    });

    it("describes a combined heading", () => {
        const upRight: Dir2d = { x: 1, y: -1 };
        const atRest: Dir2d = { x: 0, y: 0 };

        expect(upRight).toEqual({ x: 1, y: -1 });
        expect(atRest).toEqual({ x: 0, y: 0 });
    });
});
