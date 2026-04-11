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

    export const camelToKebabCase = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

    export const kebabToCamelCase = (key: string) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    export const isLineBreak = (value: string) => /^[\r\n\f\v\p{Zl}\p{Zp}]+$/u.test(value);

    export const containsLineBreak = (value: string) => /[\r\n\f\v\p{Zl}\p{Zp}]/u.test(value);

    export const omitLineBreaks = (value: string) => value.replace(/[\r\n\f\v\p{Zl}\p{Zp}]/gu, "");

    export const omitControlChars = (value: string) => value.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, "");

    export const replaceTabs = (text: string) =>
        text
            .replace(/\v/g, "")
            .replace(/(?<= )\t|\t(?= )/g, "")
            .replace(/\t/g, " ");
}
