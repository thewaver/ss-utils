import { deepEqual } from "fast-equals";

import { EMPTY_ARRAY } from "../../../../Abstracts/object.js";
import { StringUtils } from "../../../../Abstracts/string.js";
import { CSSUtils } from "../../../CSS/CSS.utils.js";
import type { TextMetricsStyle, TextNonMetricStyle } from "../Metrics/JSXTextMetrics.types.js";
import { JSXTextMetrics } from "../Metrics/JSXTextMetrics.utils.js";

type SegmentType = "text" | "linebreak" | "atomic";

/** Details carried down from the surrounding elements, so a piece of text remembers where it came from. */
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

/** A run of text along with the styles it should be measured and drawn with. */
type StyledTextSegment = {
    type: Extract<SegmentType, "text">;
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
    meta: StyledTextSegmentMeta;
};

/** A forced break — a `<br>`, a newline, or the edge of a block element. */
type LineBreakSegment = {
    type: Extract<SegmentType, "linebreak">;
};

/** An element carried through whole, such as an image or icon, which cannot be split. */
type AtomicElementSegment = {
    type: Extract<SegmentType, "atomic">;
    element: HTMLElement;
    isBlockLike?: boolean;
};

/** One piece of parsed content: a run of text, a line break, or an unsplittable element. */
export type ElementSegment = StyledTextSegment | LineBreakSegment | AtomicElementSegment;

const lineBreakToken: LineBreakSegment = { type: "linebreak" };

/**
 * Splits text into words, built on first use.
 *
 * `undefined` means "not tried yet". Deliberately lazy so nothing runs while the file
 * loads, which keeps the package importable outside a browser.
 */
let wordSegmenter: Intl.Segmenter | undefined;

const getWordSegmenter = () => (wordSegmenter ??= new Intl.Segmenter(undefined, { granularity: "word" }));

const getComputedStyles = (element: Element) => {
    const parent = element.parentElement;
    const computed = getComputedStyle(element);
    const parentComputed = parent ? getComputedStyle(parent) : undefined;

    return { computed, parentComputed };
};

const splitComputedStyle = (style: CSSStyleDeclaration, parentStyle?: CSSStyleDeclaration) => {
    const metrics: TextMetricsStyle = {};
    const nonMetrics: TextNonMetricStyle = {};

    for (const key of style) {
        const value = style[key as keyof CSSStyleDeclaration] as any;

        if (!value) continue;

        const cssKey = StringUtils.camelToKebabCase(key);

        if (CSSUtils.isCssKeyUsedToMeasureText(cssKey)) {
            metrics[cssKey] = value;
        } else if (
            CSSUtils.isCssKeyUsedToRenderText(cssKey) &&
            !CSSUtils.isCssKeyExcludedForDisplayInline(cssKey) &&
            !CSSUtils.isCssKeyExcludedForCanvasTextMeasuring(cssKey)
        ) {
            const parentValue = parentStyle?.[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !CSSUtils.isInheritedCssKey(cssKey)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    nonMetrics.display = "inline";
    nonMetrics.visibility = "visible";

    return { metrics, nonMetrics };
};

export namespace JSXTextParser {
    /** Tests whether two runs of text would be measured identically — same font, spacing and case. */
    export const isSameMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.metrics, b.metrics);

    /** Tests whether two runs of text would be drawn identically — same colour, decoration and so on. */
    export const isSameNonMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) =>
        deepEqual(a.nonMetrics, b.nonMetrics);

    /** Tests whether two runs of text came from the same surroundings — same link, title and data attributes. */
    export const isSameMeta = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.meta, b.meta);

    /**
     * Walks a rendered element and flattens it into a list of text runs, line breaks
     * and unsplittable elements.
     *
     * Each run of text carries the styles actually in force on it, read from the live
     * page, so the result can be re-measured or re-drawn faithfully. Block elements
     * become breaks around their contents; `<br>` and newlines become breaks in place;
     * childless elements such as images are carried through whole as a copy.
     *
     * Browser only — it reads computed styles, so the element must already be in the
     * document.
     *
     * @param el The element to flatten.
     * @returns The pieces in reading order, or an empty list if there is no element.
     */
    export const getSegmentTokens = (el: Node): readonly ElementSegment[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: ElementSegment[] = [];

        // Structural breaks only, which is what this collapse was written for: two blocks in
        // a row would otherwise close one and open the next, producing a stray blank line
        // between them. Breaks the author wrote — a literal newline, or a <br> — are content
        // and always push, or "a\n\nb" silently loses its blank line. Do not route the
        // explicit sites through here.
        const pushStructuralLineBreak = () => {
            if (tokens.at(-1)?.type === "linebreak") return;

            tokens.push(lineBreakToken);
        };

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
            const isBlockLike = CSSUtils.isBlockLike(computed.display);

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
                    pushStructuralLineBreak();
                }

                for (const child of Array.from(element.childNodes)) {
                    walk(child, nextMeta);
                }

                if (isBlockLike && tokens.length > 0) {
                    pushStructuralLineBreak();
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

    /**
     * Gathers neighbouring runs of text that match into groups, so each group can be
     * measured in one go.
     *
     * Line breaks and unsplittable elements always stand alone and break up a run.
     *
     * @param segments The pieces to group.
     * @param compare Decides whether a piece belongs with the one before it.
     * @returns Groups in reading order. Flattening them gives back the original list.
     */
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

    /**
     * Lays parsed content out to a given width, inserting line breaks where the text
     * runs out of room.
     *
     * Text is split into words, measured with its real styles, and wrapped when a word
     * will not fit. Words that end up next to each other with identical styling are
     * glued back into a single run, so the result holds as few pieces as possible.
     * Unsplittable elements take their own width, or the full line if they are
     * block-like.
     *
     * Browser only, since measuring reads from a canvas.
     *
     * @param segments The pieces to lay out, from {@link getSegmentTokens}.
     * @param width The line width to wrap at, in pixels.
     * @returns A new list with breaks inserted. The input is not modified.
     */
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
                    const intlSegments = segment.flatMap((s) =>
                        getWordSegmenter().segment((s as StyledTextSegment).text),
                    );
                    const texts = StringUtils.mergePunctuation(StringUtils.intlSegmentsArrayToStrings(intlSegments));
                    // measureTextWidths applies any text-transform itself, so the raw
                    // text is passed through here and the transform is applied once.
                    const widths = JSXTextMetrics.measureTextWidths(texts, metrics);

                    for (let idx = 0; idx < texts.length; idx++) {
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
