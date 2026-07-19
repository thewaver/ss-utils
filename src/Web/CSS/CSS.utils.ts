import { CSSConst } from "./CSS.const";
import { CSSBorderRadius, CSSBorderWidth, CSSCornerShape, CSSMargin, CSSPadding } from "./CSS.types";

export namespace CSSUtils {
    const INHERITED_CSS_KEYS_SET = new Set(CSSConst.INHERITED_CSS_KEYS);
    const CSS_KEYS_USED_TO_MEASURE_TEXT_SET = new Set(CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT);
    const CSS_KEYS_USED_TO_RENDER_TEXT_SET = new Set(CSSConst.CSS_KEYS_USED_TO_RENDER_TEXT);
    const CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE_SET = new Set(CSSConst.CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE);
    const CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING_SET = new Set(
        CSSConst.CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING,
    );

    export const isInheritedCssKey = (key: string): key is (typeof CSSConst.INHERITED_CSS_KEYS)[number] =>
        INHERITED_CSS_KEYS_SET.has(key as any);

    export const isCssKeyUsedToMeasureText = (
        key: string,
    ): key is (typeof CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT)[number] =>
        CSS_KEYS_USED_TO_MEASURE_TEXT_SET.has(key as any);

    export const isCssKeyUsedToRenderText = (
        key: string,
    ): key is (typeof CSSConst.CSS_KEYS_USED_TO_RENDER_TEXT)[number] =>
        CSS_KEYS_USED_TO_RENDER_TEXT_SET.has(key as any);

    export const isCssKeyEexcludedForDisplayInline = (
        key: string,
    ): key is (typeof CSSConst.CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE)[number] =>
        CSS_KEYS_EXCLUDED_FOR_DISPLAY_INLINE_SET.has(key as any);

    export const isCssKeyExcludedForCanvasTextMeasuring = (
        key: string,
    ): key is (typeof CSSConst.CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING)[number] =>
        CSS_KEYS_EXCLUDED_FOR_CANVAS_TEXT_MEASURING_SET.has(key as any);

    export const isBlockLike = (display?: string) =>
        display === "block" ||
        display === "flex" ||
        display === "grid" ||
        display === "table" ||
        display === "list-item";

    export const spreadCornerShape = (lameExponent: number): CSSCornerShape => ({
        cornerBottomLeftShape: lameExponent,
        cornerBottomRightShape: lameExponent,
        cornerTopLeftShape: lameExponent,
        cornerTopRightShape: lameExponent,
    });

    export const spreadRadius = (radius: number): CSSBorderRadius => ({
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
    });

    export const spreadWidth = (width: number): CSSBorderWidth => ({
        borderTopWidth: width,
        borderRightWidth: width,
        borderBottomWidth: width,
        borderLeftWidth: width,
    });

    export const spreadPadding = (width: number): CSSPadding => ({
        paddingTop: width,
        paddingRight: width,
        paddingBottom: width,
        paddingLeft: width,
    });

    export const spreadMargin = (width: number): CSSMargin => ({
        marginTop: width,
        marginRight: width,
        marginBottom: width,
        marginLeft: width,
    });

    export const spreadableToStyle = <T extends CSSBorderRadius | CSSBorderWidth | CSSPadding | CSSMargin>(
        entries: T,
        mapKey: (key: keyof T) => string,
    ) => Object.fromEntries(Object.entries(entries).map(([key, value]) => [mapKey(key as keyof T), `${value}px`]));
}
