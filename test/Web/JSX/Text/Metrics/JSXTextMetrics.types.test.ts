import { describe, expect, expectTypeOf, it } from "vitest";

import { CSSConst } from "../../../../../src/Web/CSS/CSS.const.js";
import type {
    TextMetricKey,
    TextMetricValue,
    TextMetricsStyle,
    TextNonMetricStyle,
} from "../../../../../src/Web/JSX/Text/Metrics/JSXTextMetrics.types.js";

// Types only, so these are compile-time checks. The sibling `JSXTextMetrics.utils.ts` is
// left out of the suite: it measures through a canvas, which needs a browser-like
// environment wired up first.

describe("TextMetricValue", () => {
    it("allows a unitless zero alongside string values", () => {
        const zero: TextMetricValue = 0;
        const withUnit: TextMetricValue = "16px";

        expect(zero).toBe(0);
        expect(withUnit).toBe("16px");
    });
});

describe("TextMetricKey", () => {
    it("is exactly the list of measuring keys", () => {
        expectTypeOf<TextMetricKey>().toEqualTypeOf<(typeof CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT)[number]>();
        expectTypeOf<"font-size">().toExtend<TextMetricKey>();
    });
});

describe("TextMetricsStyle / TextNonMetricStyle", () => {
    it("split the CSS properties between them without overlapping", () => {
        expectTypeOf<TextMetricsStyle>().toHaveProperty("font-size");
        expectTypeOf<TextNonMetricStyle>().toHaveProperty("color");
        expectTypeOf<TextNonMetricStyle>().not.toHaveProperty("font-size");
    });

    it("keeps every field optional, since a style may only set some of them", () => {
        const metrics: TextMetricsStyle = {};
        const nonMetrics: TextNonMetricStyle = {};

        expect(metrics).toEqual({});
        expect(nonMetrics).toEqual({});
    });
});
