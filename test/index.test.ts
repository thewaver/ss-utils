import { describe, expect, it } from "vitest";

import * as ssUtils from "../src/index.js";

// The package is meant to be importable outside a browser — nothing may reach for
// `document` or a canvas while the module graph is loading. Importing the barrel here is
// the check for that.

const EXPECTED_EXPORTS = [
    "BitwiseUtils",
    "Bounds",
    "BoundsString",
    "Count2d",
    "Count2dString",
    "FunctionUtils",
    "MathUtils",
    "ObjectUtils",
    "EMPTY_ARRAY",
    "EMPTY_OBJECT",
    "Point2d",
    "Point2dString",
    "Point2dUtils",
    "PolygonUtils",
    "RandomUtils",
    "Rect",
    "RectString",
    "RectUtils",
    "ShapeConst",
    "ShapeUtils",
    "Size2d",
    "Size2dString",
    "StringUtils",
    "Vec2d",
    "Vec4d",
    "CSSConst",
    "CSSUtils",
    "CSS_FILTER_KEYS",
    "CSS_TRANSFORM_KEYS",
    "KeyframesUtils",
    "DOMUtils",
    "JSXTextMetrics",
    "JSXTextParser",
    "SVGUtils",
    "IOUtils",
] as const;

describe("the package entry point", () => {
    it("loads without touching any browser global", () => {
        expect(ssUtils).toBeTypeOf("object");
    });

    it("re-exports every namespace", () => {
        for (const name of EXPECTED_EXPORTS) {
            expect(ssUtils).toHaveProperty(name);
        }
    });

    it("exports nothing beyond what is listed here", () => {
        expect(Object.keys(ssUtils).sort()).toEqual([...EXPECTED_EXPORTS].sort());
    });
});
