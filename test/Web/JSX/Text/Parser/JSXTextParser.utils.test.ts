import { describe, expect, it, vi } from "vitest";

import { ElementSegment, JSXTextParser } from "../../../../../src/Web/JSX/Text/Parser/JSXTextParser.utils.js";

// `getSegmentTokens` and `getInlinedSegments` are left out on purpose: the first reads
// computed styles off a live element and the second measures through a canvas, so both
// need a browser-like environment wired up first.

type TextSegment = Extract<ElementSegment, { type: "text" }>;

const textSegment = (
    text: string,
    overrides: {
        metrics?: Record<string, string>;
        nonMetrics?: Record<string, string>;
        meta?: { title?: string; href?: string };
    } = {},
): TextSegment =>
    ({
        type: "text",
        text,
        metrics: overrides.metrics ?? { "font-size": "16px" },
        nonMetrics: overrides.nonMetrics ?? { color: "black" },
        meta: {
            common: { dataset: {}, title: overrides.meta?.title ?? "" },
            ...(overrides.meta?.href ? { anchor: { href: overrides.meta.href } } : {}),
        },
    }) as unknown as TextSegment;

const lineBreak = { type: "linebreak" } as ElementSegment;
const atomic = { type: "atomic", element: {} } as unknown as ElementSegment;

describe("JSXTextParser.isSameMetricsStyle", () => {
    it("compares only the measuring styles", () => {
        const a = textSegment("a", { metrics: { "font-size": "16px" }, nonMetrics: { color: "red" } });
        const b = textSegment("b", { metrics: { "font-size": "16px" }, nonMetrics: { color: "blue" } });

        expect(JSXTextParser.isSameMetricsStyle(a, b)).toBe(true);
    });

    it("spots a different font size", () => {
        const a = textSegment("a", { metrics: { "font-size": "16px" } });
        const b = textSegment("b", { metrics: { "font-size": "20px" } });

        expect(JSXTextParser.isSameMetricsStyle(a, b)).toBe(false);
    });
});

describe("JSXTextParser.isSameNonMetricsStyle", () => {
    it("compares only the drawing styles", () => {
        const a = textSegment("a", { metrics: { "font-size": "16px" }, nonMetrics: { color: "red" } });
        const b = textSegment("b", { metrics: { "font-size": "99px" }, nonMetrics: { color: "red" } });

        expect(JSXTextParser.isSameNonMetricsStyle(a, b)).toBe(true);
        expect(JSXTextParser.isSameNonMetricsStyle(a, textSegment("c", { nonMetrics: { color: "blue" } }))).toBe(false);
    });
});

describe("JSXTextParser.isSameMeta", () => {
    it("compares where the text came from", () => {
        expect(JSXTextParser.isSameMeta(textSegment("a"), textSegment("b"))).toBe(true);
        expect(
            JSXTextParser.isSameMeta(textSegment("a", { meta: { href: "/one" } }), textSegment("b", { meta: {} })),
        ).toBe(false);
        expect(
            JSXTextParser.isSameMeta(
                textSegment("a", { meta: { href: "/one" } }),
                textSegment("b", { meta: { href: "/one" } }),
            ),
        ).toBe(true);
    });

    it("spots a different title", () => {
        expect(
            JSXTextParser.isSameMeta(
                textSegment("a", { meta: { title: "one" } }),
                textSegment("b", { meta: { title: "two" } }),
            ),
        ).toBe(false);
    });
});

describe("JSXTextParser.groupIdenticalTextSegments", () => {
    const alwaysMatch = () => true;

    it("gathers neighbouring matching runs into one group", () => {
        const segments = [textSegment("a"), textSegment("b"), textSegment("c")];

        expect(JSXTextParser.groupIdenticalTextSegments(segments, alwaysMatch)).toEqual([segments]);
    });

    it("starts a new group where the comparison fails", () => {
        const segments = [textSegment("a"), textSegment("b")];

        expect(JSXTextParser.groupIdenticalTextSegments(segments, () => false)).toEqual([[segments[0]], [segments[1]]]);
    });

    it("compares against the previous run in the group", () => {
        const compare = vi.fn(() => true);
        const segments = [textSegment("a"), textSegment("b")];

        JSXTextParser.groupIdenticalTextSegments(segments, compare);

        expect(compare).toHaveBeenCalledExactlyOnceWith(segments[0], segments[1]);
    });

    it("keeps line breaks and unsplittable elements in groups of their own", () => {
        const a = textSegment("a");
        const b = textSegment("b");

        expect(JSXTextParser.groupIdenticalTextSegments([a, lineBreak, b, atomic], alwaysMatch)).toEqual([
            [a],
            [lineBreak],
            [b],
            [atomic],
        ]);
    });

    it("does not emit an empty group when a break comes first", () => {
        const a = textSegment("a");

        expect(JSXTextParser.groupIdenticalTextSegments([lineBreak, a], alwaysMatch)).toEqual([[lineBreak], [a]]);
    });

    it("gives an empty result for no segments", () => {
        expect(JSXTextParser.groupIdenticalTextSegments([], alwaysMatch)).toEqual([]);
    });

    it("flattens back to the original list", () => {
        const segments = [textSegment("a"), lineBreak, textSegment("b"), textSegment("c"), atomic];

        expect(JSXTextParser.groupIdenticalTextSegments(segments, alwaysMatch).flat()).toEqual(segments);
    });
});
