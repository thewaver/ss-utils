import { Size2d } from "../../../../Abstracts/size";
import { StringUtils } from "../../../../Abstracts/string";
import type { TextMetricValue, TextMetricsStyle } from "./JSXTextMetrics.types";

export namespace JSXTextMetrics {
    export const parseTextMetric = (value: TextMetricValue | undefined, fallback: number = 0) => {
        if (!value) return fallback;

        const result = typeof value === "number" ? value : parseFloat(value);

        if (Number.isNaN(result)) return fallback;
        return result;
    };

    export const measureTextWidths = (() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: false });

        return (texts: string[], metrics: TextMetricsStyle): number[] => {
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
    })();

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

        const textWidths = measureTextWidths(texts, metrics).map((w) => (fontSize * containerSize.width) / w);
        const totalHeight = textWidths.reduce((res, cur, idx) => res + cur * (opts?.lineHeightRatios[idx] ?? 1), 0);
        const ratio = Math.min(containerSize.height / totalHeight, 1);

        return textWidths.map((size) => Math.floor(size * ratio));
    };
}
