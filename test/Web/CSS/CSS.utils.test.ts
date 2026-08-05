import { describe, expect, it } from "vitest";

import { StringUtils } from "../../../src/Abstracts/string.js";
import { CSSUtils } from "../../../src/Web/CSS/CSS.utils.js";

describe("CSSUtils key predicates", () => {
    it("recognises properties that pass down to children", () => {
        expect(CSSUtils.isInheritedCssKey("color")).toBe(true);
        expect(CSSUtils.isInheritedCssKey("letter-spacing")).toBe(true);
        expect(CSSUtils.isInheritedCssKey("width")).toBe(false);
    });

    it("recognises properties that change how wide text comes out", () => {
        expect(CSSUtils.isCssKeyUsedToMeasureText("font-size")).toBe(true);
        expect(CSSUtils.isCssKeyUsedToMeasureText("font-family")).toBe(true);
        expect(CSSUtils.isCssKeyUsedToMeasureText("color")).toBe(false);
    });

    it("recognises properties that change how text looks", () => {
        expect(CSSUtils.isCssKeyUsedToRenderText("color")).toBe(true);
        expect(CSSUtils.isCssKeyUsedToRenderText("not-a-property")).toBe(false);
    });

    it("recognises properties an inline element ignores", () => {
        expect(CSSUtils.isCssKeyExcludedForDisplayInline("height")).toBe(true);
        expect(CSSUtils.isCssKeyExcludedForDisplayInline("color")).toBe(false);
    });

    it("recognises properties a canvas cannot reproduce", () => {
        expect(CSSUtils.isCssKeyExcludedForCanvasTextMeasuring("color")).toBe(false);
        expect(CSSUtils.isCssKeyExcludedForCanvasTextMeasuring("not-a-property")).toBe(false);
    });

    it("takes dashed names, not camel-case ones", () => {
        expect(CSSUtils.isInheritedCssKey("letterSpacing")).toBe(false);
        expect(CSSUtils.isCssKeyUsedToMeasureText("fontSize")).toBe(false);
    });
});

describe("CSSUtils.isBlockLike", () => {
    it("finds the display values that start a new line", () => {
        for (const display of ["block", "flex", "grid", "table", "list-item"]) {
            expect(CSSUtils.isBlockLike(display)).toBe(true);
        }
    });

    it("rejects inline and unknown values", () => {
        expect(CSSUtils.isBlockLike("inline")).toBe(false);
        expect(CSSUtils.isBlockLike("inline-block")).toBe(false);
        expect(CSSUtils.isBlockLike("nonsense")).toBe(false);
        expect(CSSUtils.isBlockLike()).toBe(false);
    });
});

describe("CSSUtils spread helpers", () => {
    it("applies one corner style to all four corners", () => {
        expect(CSSUtils.spreadCornerShape(2)).toEqual({
            cornerBottomLeftShape: 2,
            cornerBottomRightShape: 2,
            cornerTopLeftShape: 2,
            cornerTopRightShape: 2,
        });
    });

    it("applies one radius to all four corners", () => {
        expect(CSSUtils.spreadRadius(8)).toEqual({
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
        });
    });

    it("applies one width, padding and margin to all four sides", () => {
        expect(CSSUtils.spreadWidth(1)).toEqual({
            borderTopWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
        });
        expect(CSSUtils.spreadPadding(4)).toEqual({
            paddingTop: 4,
            paddingRight: 4,
            paddingBottom: 4,
            paddingLeft: 4,
        });
        expect(CSSUtils.spreadMargin(-2)).toEqual({
            marginTop: -2,
            marginRight: -2,
            marginBottom: -2,
            marginLeft: -2,
        });
    });
});

describe("CSSUtils.spreadableToStyle", () => {
    it("adds px units and renames the keys", () => {
        expect(
            CSSUtils.spreadableToStyle(CSSUtils.spreadPadding(4), (key) => StringUtils.camelToKebabCase(key)),
        ).toEqual({
            "padding-top": "4px",
            "padding-right": "4px",
            "padding-bottom": "4px",
            "padding-left": "4px",
        });
    });

    it("lets one set of numbers feed a different property", () => {
        expect(
            CSSUtils.spreadableToStyle(CSSUtils.spreadPadding(1), (key) =>
                StringUtils.camelToKebabCase(key).replace("padding", "inset"),
            ),
        ).toEqual({
            "inset-top": "1px",
            "inset-right": "1px",
            "inset-bottom": "1px",
            "inset-left": "1px",
        });
    });
});
