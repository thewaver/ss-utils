import { describe, expect, it } from "vitest";

import { CSSConst } from "../../../src/Web/CSS/CSS.const.js";

const KEY_LISTS = {
    INHERITED_CSS_KEYS: CSSConst.INHERITED_CSS_KEYS,
    CSS_KEYS_USED_TO_MEASURE_TEXT: CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT,
    CSS_KEYS_USED_TO_RENDER_TEXT: CSSConst.CSS_KEYS_USED_TO_RENDER_TEXT,
    CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE: CSSConst.CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE,
    CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING: CSSConst.CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING,
} as const;

describe("CSSConst key lists", () => {
    it.each(Object.entries(KEY_LISTS))("%s holds no duplicates", (_name, keys) => {
        expect(new Set<string>(keys).size).toBe(keys.length);
    });

    it.each(Object.entries(KEY_LISTS))("%s is written in dashed CSS form", (_name, keys) => {
        for (const key of keys) {
            expect(key).toMatch(/^-{0,2}[a-z][a-z0-9-]*$/);
        }
    });

    it.each(Object.entries(KEY_LISTS))("%s is not empty", (_name, keys) => {
        expect(keys.length).toBeGreaterThan(0);
    });

    it("keeps measuring and rendering keys apart", () => {
        const measuring = new Set<string>(CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT);

        for (const key of CSSConst.CSS_KEYS_USED_TO_RENDER_TEXT) {
            expect(measuring.has(key)).toBe(false);
        }
    });
});

describe("CSSConst.ANIMATION_UNITS", () => {
    it("gives every animatable key a unit per argument", () => {
        const entries = Object.entries(CSSConst.ANIMATION_UNITS);

        expect(entries.length).toBeGreaterThan(0);

        for (const [, units] of entries) {
            expect(Array.isArray(units)).toBe(true);
            expect(units.length).toBeGreaterThan(0);

            for (const unit of units) {
                expect(typeof unit).toBe("string");
            }
        }
    });
});
