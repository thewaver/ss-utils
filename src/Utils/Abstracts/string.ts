export namespace StringUtils {
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
                return text.replace(/\b\p{L}/gu, (m) => m.toUpperCase());
            default:
                return text;
        }
    };

    export const camelToKebabCase = (key: string) =>
        key
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase();

    export const kebabToCamelCase = (key: string) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    export const isLineBreak = (value: string) => /^[\r\n\f\v\p{Zl}\p{Zp}]+$/u.test(value);

    export const containsLineBreak = (value: string) => /[\r\n\f\v\p{Zl}\p{Zp}]/u.test(value);

    export const omitLineBreaks = (value: string) => value.replace(/[\r\n\f\v\p{Zl}\p{Zp}]/gu, "");

    export const splitByLinebreaks = (s: string) =>
        s.match(/\r\n|[\r\n\f\v\p{Zl}\p{Zp}]|[^\r\n\f\v\p{Zl}\p{Zp}]+/gu) ?? [];

    export const isWhitespace = (s: string) => /^\s+$/.test(s);

    export const isClosingPunctuation = (s: string) => /^[\p{Pe}\p{Pf}\p{Po}\p{S}]*$/u.test(s) && !/^\p{Pi}+$/u.test(s);

    export const omitControlChars = (value: string) => value.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, "");

    export const replaceTabs = (text: string) =>
        text
            .replace(/\v/g, "")
            .replace(/(?<= )\t|\t(?= )/g, "")
            .replace(/\t/g, " ");

    export const intlSegmentsToStrings = (segments: Intl.Segments): string[] => Array.from(segments, (s) => s.segment);

    export const intlSegmentsArrayToStrings = (segmentsArr: Intl.Segments[]): string[] =>
        segmentsArr.flatMap((segments) => intlSegmentsToStrings(segments));

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
