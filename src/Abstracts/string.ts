export namespace StringUtils {
    /**
     * Applies a CSS `text-transform` to a string.
     *
     * @param text The text to change.
     * @param transform One of `uppercase`, `lowercase` or `capitalize`. Anything else,
     * including `none` or nothing at all, returns the text untouched.
     * @returns The transformed text. Applying the same transform twice changes nothing
     * further, so it is safe to call more than once.
     */
    export const applyTextTransform = (
        text: string,
        transform?: "capitalize" | "lowercase" | "uppercase" | (string & {}),
    ): string => {
        switch (transform) {
            case "uppercase":
                return text.toUpperCase();
            case "lowercase":
                return text.toLowerCase();
            case "capitalize":
                // Deliberately not `\b`, which is ASCII-only: it sees no boundary before
                // "état" and one *inside* it, giving "éTat". Matching a letter that has
                // no letter or digit before it works the same way for ASCII and keeps
                // accented words intact.
                return text.replace(/(?<![\p{L}\p{N}])\p{L}/gu, (m) => m.toUpperCase());
            default:
                return text;
        }
    };

    /**
     * Converts a JavaScript-style name to a CSS-style one, so `backgroundColor`
     * becomes `background-color`.
     *
     * Runs of capitals are handled sensibly: `borderTRBLWidth` becomes
     * `border-trbl-width` rather than splitting every letter.
     */
    export const camelToKebabCase = (key: string) =>
        key
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase();

    /**
     * Converts a CSS-style name to a JavaScript-style one, so `background-color`
     * becomes `backgroundColor`.
     */
    export const kebabToCamelCase = (key: string) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    /** Tests whether a string is made up **entirely** of line breaks. Empty strings are not. */
    export const isLineBreak = (value: string) => /^[\r\n\f\v\p{Zl}\p{Zp}]+$/u.test(value);

    /** Tests whether a string contains at least one line break anywhere. */
    export const containsLineBreak = (value: string) => /[\r\n\f\v\p{Zl}\p{Zp}]/u.test(value);

    /** Strips every line break out of a string, joining the surrounding text together. */
    export const omitLineBreaks = (value: string) => value.replace(/[\r\n\f\v\p{Zl}\p{Zp}]/gu, "");

    /**
     * Splits text into runs, keeping the line breaks as entries of their own.
     *
     * `"a\nb"` becomes `["a", "\n", "b"]`. A Windows `\r\n` pair stays together as one
     * entry. This lets a caller walk the text and handle breaks explicitly rather than
     * losing them.
     */
    export const splitByLinebreaks = (s: string) =>
        s.match(/\r\n|[\r\n\f\v\p{Zl}\p{Zp}]|[^\r\n\f\v\p{Zl}\p{Zp}]+/gu) ?? [];

    /** Tests whether a string is made up **entirely** of whitespace. Empty strings are not. */
    export const isWhitespace = (s: string) => /^\s+$/.test(s);

    /**
     * Tests whether a string is punctuation that belongs tight against the word before
     * it — a full stop, a closing bracket, a closing quote.
     *
     * Opening quotes are deliberately excluded, since those attach to the word that
     * *follows*. Empty strings are not closing punctuation.
     */
    export const isClosingPunctuation = (s: string) => /^[\p{Pe}\p{Pf}\p{Po}\p{S}]+$/u.test(s) && !/^\p{Pi}+$/u.test(s);

    /** Strips invisible control characters out of a string. */
    export const omitControlChars = (value: string) => value.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, "");

    /**
     * Replaces tabs with single spaces, the way HTML rendering collapses them.
     *
     * A tab that already sits next to a space is dropped rather than doubling up.
     */
    export const replaceTabs = (text: string) =>
        text
            .replace(/\v/g, "")
            .replace(/(?<= )\t|\t(?= )/g, "")
            .replace(/\t/g, " ");

    /** Pulls the plain strings out of an `Intl.Segmenter` result. */
    export const intlSegmentsToStrings = (segments: Intl.Segments): string[] => Array.from(segments, (s) => s.segment);

    /** Pulls the plain strings out of several `Intl.Segmenter` results and flattens them into one list. */
    export const intlSegmentsArrayToStrings = (segmentsArr: Intl.Segments[]): string[] =>
        segmentsArr.flatMap((segments) => intlSegmentsToStrings(segments));

    /**
     * Glues trailing punctuation onto the word before it.
     *
     * Word splitters hand back `["Hi", "!"]`, which would let a line wrap between the
     * word and its exclamation mark. This rejoins them into `["Hi!"]` so they travel
     * as one unit. Punctuation following a space, or starting the list, is left alone.
     *
     * @param tokens The pieces to fix up. Never modified.
     * @returns A new list, the same length or shorter.
     */
    export const mergePunctuation = (tokens: string[]) => {
        const result: string[] = [];

        let shouldAttachToLast = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (isClosingPunctuation(token)) {
                if (!result.length || !shouldAttachToLast) {
                    result.push(token);
                } else {
                    result[result.length - 1] += token;
                }

                shouldAttachToLast = true;
            } else {
                result.push(token);

                shouldAttachToLast = !isWhitespace(token);
            }
        }

        return result;
    };
}
