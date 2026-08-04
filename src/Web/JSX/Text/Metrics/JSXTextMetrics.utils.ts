import { Size2d } from "../../../../Abstracts/size.js";
import { StringUtils } from "../../../../Abstracts/string.js";
import type { TextMetricValue, TextMetricsStyle } from "./JSXTextMetrics.types.js";

export namespace JSXTextMetrics {
    /**
     * Reads a CSS length such as `"16px"` as a plain number.
     *
     * @param value The value to read. Numbers pass straight through.
     * @param fallback Used when the value is missing, empty or not a number at all.
     * @returns The number, or `fallback`. The unit is ignored, so `"16px"` and `"16em"`
     * both read as `16` — only pass values already resolved to pixels.
     */
    export const parseTextMetric = (value: TextMetricValue | undefined, fallback: number = 0) => {
        if (!value) return fallback;

        const result = typeof value === "number" ? value : parseFloat(value);

        if (Number.isNaN(result)) return fallback;
        return result;
    };

    /**
     * The canvas used for measuring, built the first time it is actually needed.
     *
     * `undefined` means "not tried yet"; `null` means "tried, and there is no document
     * to build one in". Deliberately lazy: creating this while the file loads would
     * make the whole package throw on import under Node, during server-side rendering,
     * and in any test runner without a DOM.
     */
    let measureContext: CanvasRenderingContext2D | null | undefined;

    const getMeasureContext = () => {
        if (measureContext === undefined) {
            measureContext =
                typeof document === "undefined"
                    ? null
                    : document.createElement("canvas").getContext("2d", { willReadFrequently: false });
        }

        return measureContext;
    };

    /**
     * Measures how wide each string would be when drawn with the given styles.
     *
     * Measures off-screen on a canvas, so nothing is added to the page and no layout is
     * triggered. Letter spacing is added on top of the raw measurement, since canvas
     * ignores it; word spacing is added for whitespace runs only.
     *
     * Any `text-transform` in the styles is applied before measuring, so pass the
     * untransformed text — transforming it yourself first is harmless but pointless.
     *
     * @param texts The strings to measure.
     * @param metrics The font styles to measure against.
     * @returns One width in pixels per string, in the same order. Returns all zeroes
     * when there is no document to measure in, such as during server-side rendering.
     */
    export const measureTextWidths = (texts: string[], metrics: TextMetricsStyle): number[] => {
        const ctx = getMeasureContext();

        if (!ctx) return texts.map(() => 0);

        ctx.font = `${metrics["font-style"] ?? "normal"} ${metrics["font-weight"] ?? "normal"} ${metrics["font-size"] ?? "1rem"} ${metrics["font-family"] ?? "sans-serif"}`;

        const letterSpacing = parseTextMetric(metrics["letter-spacing"]);
        const wordSpacing = parseTextMetric(metrics["word-spacing"]);
        const results: number[] = new Array(texts.length);

        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];

            if (StringUtils.isWhitespace(texts[i])) {
                results[i] =
                    ctx.measureText(text).width + (text.length - 1) * letterSpacing + text.length * wordSpacing;
            } else {
                const transformedText =
                    typeof metrics["text-transform"] === "string"
                        ? StringUtils.applyTextTransform(text, metrics["text-transform"])
                        : text;

                results[i] = ctx.measureText(transformedText).width + (transformedText.length - 1) * letterSpacing;
            }
        }

        return results;
    };

    /**
     * Works out a font size per line so a block of text fills its container as fully as
     * possible.
     *
     * Each line is first scaled so it spans the container's full width, then every line
     * is scaled down together until the stack fits the height. Lines therefore keep
     * their relative sizes — a short line ends up larger than a long one.
     *
     * @param texts One string per line.
     * @param metrics The font styles to measure against. Its `font-size` sets the
     * starting scale and must be a usable number.
     * @param containerSize The box to fill.
     * @param opts.lineHeightRatios Line height per line, as a multiple of its font
     * size. Missing entries count as `1`.
     * @returns One whole-number font size per line. Returns all zeroes if the starting
     * `font-size` cannot be read. Empty lines contribute `0` rather than poisoning the
     * result.
     */
    export const getNormalizedFontSizes = (
        texts: string[],
        metrics: TextMetricsStyle,
        containerSize: Size2d,
        opts?: {
            lineHeightRatios: number[];
        },
    ): number[] => {
        const fontSize =
            typeof metrics["font-size"] === "number" ? metrics["font-size"] : parseFloat(metrics["font-size"] ?? "NaN");

        if (Number.isNaN(fontSize)) return texts.map(() => 0);

        // An empty string measures 0 wide. Dividing by that would give Infinity, which
        // would drag the whole stack's scale to 0 and blank out every other line.
        const fittedSizes = measureTextWidths(texts, metrics).map((w) =>
            w > 0 ? (fontSize * containerSize.width) / w : 0,
        );
        const totalHeight = fittedSizes.reduce((res, cur, idx) => res + cur * (opts?.lineHeightRatios[idx] ?? 1), 0);
        const ratio = totalHeight > 0 ? Math.min(containerSize.height / totalHeight, 1) : 1;

        return fittedSizes.map((size) => Math.floor(size * ratio));
    };
}
