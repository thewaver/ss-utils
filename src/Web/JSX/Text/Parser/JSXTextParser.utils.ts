import { deepEqual } from "fast-equals";

import { EMPTY_ARRAY } from "../../../../Abstracts/object";
import { StringUtils } from "../../../../Abstracts/string";
import { CssUtils } from "../../../CSS/CSS.utils";
import type { TextMetricsStyle, TextNonMetricStyle } from "../Metrics/JSXTextMetrics.types";
import { TextUtils } from "../Metrics/JSXTextMetrics.utils";

type SegmentType = "text" | "linebreak" | "atomic";

type StyledTextSegmentMeta = {
    common: {
        dataset: DOMStringMap;
        title: string;
    };
    anchor?: {
        href?: string;
        target?: string;
        rel?: string;
    };
};

type StyledTextSegment = {
    type: Extract<SegmentType, "text">;
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
    meta: StyledTextSegmentMeta;
};

type LineBreakSegment = {
    type: Extract<SegmentType, "linebreak">;
};

type AtomicElementSegment = {
    type: Extract<SegmentType, "atomic">;
    element: HTMLElement;
    isBlockLike?: boolean;
};

export type ElementSegment = StyledTextSegment | LineBreakSegment | AtomicElementSegment;

const lineBreakToken: LineBreakSegment = { type: "linebreak" };
const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });

const getComputedStyles = (node: Node) => {
    const grandParent = node.parentElement;
    const computed = getComputedStyle(node as HTMLElement);
    const parentComputed = grandParent ? getComputedStyle(grandParent) : undefined;

    return { computed, parentComputed };
};

const splitComputedStyle = (style: CSSStyleDeclaration, parentStyle?: CSSStyleDeclaration) => {
    const metrics: TextMetricsStyle = {};
    const nonMetrics: TextNonMetricStyle = {};

    for (const key of style) {
        const value = style[key as keyof CSSStyleDeclaration] as any;

        if (!value) continue;

        const cssKey = StringUtils.camelToKebabCase(key);

        if (CssUtils.isCssKeyUsedToMeasureText(cssKey)) {
            metrics[cssKey] = value;
        } else if (
            CssUtils.isCssKeyUsedToRenderText(cssKey) &&
            !CssUtils.isCssKeyEexcludedForDisplayInline(cssKey) &&
            !CssUtils.isCssKeyExcludedForCanvasTextMeasuring(cssKey)
        ) {
            const parentValue = parentStyle?.[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !CssUtils.isInheritedCssKey(key)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    nonMetrics.display = "inline";
    nonMetrics.visibility = "visible";

    return { metrics, nonMetrics };
};

export namespace JSXTextParser {
    export const isSameMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.metrics, b.metrics);

    export const isSameNonMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) =>
        deepEqual(a.nonMetrics, b.nonMetrics);

    export const isSameMeta = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.meta, b.meta);

    export const getSegmentTokens = (el: Node): readonly ElementSegment[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: ElementSegment[] = [];

        const walk = (node: Node, meta: StyledTextSegmentMeta) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                if (!text) return;

                const parent = node.parentElement;

                if (!parent) return;

                const { computed, parentComputed } = getComputedStyles(parent);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of StringUtils.splitByLinebreaks(text)) {
                    const parsedPart = StringUtils.replaceTabs(part);

                    if (StringUtils.isLineBreak(parsedPart)) {
                        tokens.push(lineBreakToken);
                    } else {
                        tokens.push({
                            type: "text",
                            text: parsedPart,
                            metrics,
                            nonMetrics,
                            meta,
                        });
                    }
                }

                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const element = node as HTMLElement;

            if (element.nodeName === "BR") {
                tokens.push(lineBreakToken);

                return;
            }

            const computed = getComputedStyle(element);
            const isBlockLike = CssUtils.isBlockLike(computed.display);

            if (element.childNodes.length === 0 && computed.display !== "contents") {
                tokens.push({
                    type: "atomic",
                    element: node.cloneNode(true) as HTMLElement,
                    isBlockLike,
                });
            } else {
                const nextMeta = {
                    ...meta,
                    common: {
                        dataset: element.dataset,
                        title: element.title,
                    },
                };

                if (element instanceof HTMLAnchorElement) {
                    nextMeta.anchor = {
                        href: element.href,
                        target: element.target,
                        rel: element.rel,
                    };
                }

                if (isBlockLike && tokens.length > 0) {
                    tokens.push(lineBreakToken);
                }

                for (const child of Array.from(element.childNodes)) {
                    walk(child, nextMeta);
                }

                if (isBlockLike && tokens.length > 0) {
                    tokens.push(lineBreakToken);
                }
            }
        };

        walk(el, {
            common: {
                dataset: {},
                title: "",
            },
        });

        return tokens;
    };

    export const groupIdenticalTextSegments = (
        segments: readonly ElementSegment[],
        compare: (A: StyledTextSegment, B: StyledTextSegment) => boolean,
    ) => {
        const groups: ElementSegment[][] = [];

        let current: ElementSegment[] = [];

        for (const segment of segments) {
            if (segment.type === "linebreak" || segment.type === "atomic") {
                if (current.length) {
                    groups.push(current);
                }

                groups.push([segment]);
                current = [];

                continue;
            } else if (!current.length || compare(current.at(-1) as StyledTextSegment, segment)) {
                current.push(segment);

                continue;
            }

            groups.push(current);
            current = [segment];
        }

        if (current.length) groups.push(current);

        return groups;
    };

    export const getInlinedSegments = (segments: readonly ElementSegment[], width: number) => {
        const result: ElementSegment[] = [];
        const identicalSegmentGroups = groupIdenticalTextSegments(
            segments,
            (a, b) => isSameMeta(a, b) && isSameMetricsStyle(a, b) && isSameNonMetricsStyle(a, b),
        );

        let remainingWidth = width;
        let segmentId = 0;
        let lastTextSegmentId = 0;

        const addLineBreak = () => {
            result.push(lineBreakToken);
            remainingWidth = width;
        };

        const addToken = (token: ElementSegment, tokenWidth: number) => {
            if (tokenWidth > remainingWidth && !(token.type === "text" && StringUtils.isWhitespace(token.text))) {
                addLineBreak();
            }

            const prevToken = result.at(-1);

            if (segmentId === lastTextSegmentId && prevToken?.type === "text" && token.type === "text") {
                prevToken.text += token.text;
            } else {
                result.push(token);
            }

            remainingWidth -= tokenWidth;

            if (token.type === "text") {
                lastTextSegmentId = segmentId;
            }
        };

        for (const segment of identicalSegmentGroups) {
            switch (segment[0].type) {
                case "atomic": {
                    for (const token of segment) {
                        addToken(
                            token,
                            (token as AtomicElementSegment).isBlockLike
                                ? width
                                : (token as AtomicElementSegment).element.offsetWidth,
                        );
                    }

                    break;
                }
                case "linebreak": {
                    addLineBreak();

                    break;
                }
                case "text": {
                    const metrics = segment[0].metrics;
                    const intlSegments = segment.flatMap((s) => wordSegmenter.segment((s as StyledTextSegment).text));
                    const texts = StringUtils.mergePunctuation(StringUtils.intlSegmentsArrayToStrings(intlSegments));
                    const transformedTexts =
                        typeof metrics["text-transform"] === "string"
                            ? texts.map((t) => StringUtils.applyTextTransform(t, metrics["text-transform"]))
                            : texts;

                    const widths = TextUtils.measureTextWidths(transformedTexts, metrics);

                    for (let idx = 0; idx < transformedTexts.length; idx++) {
                        addToken({ ...segment[0], text: texts[idx] }, widths[idx]);
                    }

                    break;
                }
            }

            segmentId++;
        }

        return result;
    };
}
