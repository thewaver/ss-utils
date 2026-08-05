import { describe, expect, expectTypeOf, it } from "vitest";

import { CSSConst } from "../../../src/Web/CSS/CSS.const.js";
import type {
    CSSAnimationKey,
    CSSBorderRadius,
    CSSBorderWidth,
    CSSCornerShape,
    CSSFilterKey,
    CSSMargin,
    CSSPadding,
    CSSTransformKey,
} from "../../../src/Web/CSS/CSS.types.js";
import { CSS_FILTER_KEYS, CSS_TRANSFORM_KEYS } from "../../../src/Web/CSS/CSS.types.js";

describe("CSS_TRANSFORM_KEYS / CSS_FILTER_KEYS", () => {
    it("hold no duplicates", () => {
        expect(new Set<string>(CSS_TRANSFORM_KEYS).size).toBe(CSS_TRANSFORM_KEYS.length);
        expect(new Set<string>(CSS_FILTER_KEYS).size).toBe(CSS_FILTER_KEYS.length);
    });

    it("do not overlap", () => {
        const transforms = new Set<string>(CSS_TRANSFORM_KEYS);

        for (const key of CSS_FILTER_KEYS) {
            expect(transforms.has(key)).toBe(false);
        }
    });

    it("each have a unit to animate with", () => {
        for (const key of [...CSS_TRANSFORM_KEYS, ...CSS_FILTER_KEYS]) {
            expect(CSSConst.ANIMATION_UNITS).toHaveProperty(key);
        }
    });

    it("account for every animatable key", () => {
        expect(Object.keys(CSSConst.ANIMATION_UNITS).sort()).toEqual(
            [...CSS_TRANSFORM_KEYS, ...CSS_FILTER_KEYS].sort(),
        );
    });
});

describe("CSS side and corner shapes", () => {
    // Types only, so these are compile-time checks.
    it("name all four sides", () => {
        expectTypeOf<keyof CSSMargin>().toEqualTypeOf<"marginTop" | "marginRight" | "marginBottom" | "marginLeft">();
        expectTypeOf<keyof CSSPadding>().toEqualTypeOf<
            "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
        >();
        expectTypeOf<keyof CSSBorderWidth>().toEqualTypeOf<
            "borderTopWidth" | "borderRightWidth" | "borderBottomWidth" | "borderLeftWidth"
        >();
    });

    it("name all four corners", () => {
        expectTypeOf<keyof CSSBorderRadius>().toEqualTypeOf<
            "borderTopLeftRadius" | "borderTopRightRadius" | "borderBottomLeftRadius" | "borderBottomRightRadius"
        >();
        expectTypeOf<keyof CSSCornerShape>().toEqualTypeOf<
            "cornerTopLeftShape" | "cornerTopRightShape" | "cornerBottomLeftShape" | "cornerBottomRightShape"
        >();
    });

    it("hold plain numbers", () => {
        expectTypeOf<CSSMargin["marginTop"]>().toEqualTypeOf<number>();
        expectTypeOf<CSSCornerShape["cornerTopLeftShape"]>().toEqualTypeOf<number>();
    });
});

describe("CSSAnimationKey", () => {
    it("covers both transforms and filters", () => {
        expectTypeOf<CSSAnimationKey>().toEqualTypeOf<CSSFilterKey | CSSTransformKey>();
        expectTypeOf<"blur">().toExtend<CSSAnimationKey>();
        expectTypeOf<"rotate">().toExtend<CSSAnimationKey>();
    });
});
