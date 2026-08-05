import { describe, expect, it } from "vitest";

import { StringUtils } from "../../src/Abstracts/string.js";

describe("StringUtils.applyTextTransform", () => {
    it("applies each supported transform", () => {
        expect(StringUtils.applyTextTransform("hello World", "uppercase")).toBe("HELLO WORLD");
        expect(StringUtils.applyTextTransform("Hello World", "lowercase")).toBe("hello world");
        expect(StringUtils.applyTextTransform("hello world", "capitalize")).toBe("Hello World");
    });

    it("leaves the text alone for anything else", () => {
        expect(StringUtils.applyTextTransform("hello world")).toBe("hello world");
        expect(StringUtils.applyTextTransform("hello world", "none")).toBe("hello world");
        expect(StringUtils.applyTextTransform("hello world", "full-width")).toBe("hello world");
    });

    it("is safe to apply twice", () => {
        const once = StringUtils.applyTextTransform("hello world", "capitalize");

        expect(StringUtils.applyTextTransform(once, "capitalize")).toBe(once);
    });

    it("capitalizes every word of plain ASCII text", () => {
        expect(StringUtils.applyTextTransform("one two three", "capitalize")).toBe("One Two Three");
    });

    it("capitalizes a word that starts with a non-ASCII letter", () => {
        expect(StringUtils.applyTextTransform("état lisboa", "capitalize")).toBe("État Lisboa");
        expect(StringUtils.applyTextTransform("ñandú über", "capitalize")).toBe("Ñandú Über");
    });

    it("does not capitalize mid-word after a digit", () => {
        expect(StringUtils.applyTextTransform("grid2columns", "capitalize")).toBe("Grid2columns");
    });

    it("starts a new word after punctuation", () => {
        expect(StringUtils.applyTextTransform("(one) two", "capitalize")).toBe("(One) Two");
    });
});

describe("StringUtils.camelToKebabCase", () => {
    it("splits on capitals", () => {
        expect(StringUtils.camelToKebabCase("backgroundColor")).toBe("background-color");
        expect(StringUtils.camelToKebabCase("color")).toBe("color");
    });

    it("keeps runs of capitals together", () => {
        expect(StringUtils.camelToKebabCase("borderTRBLWidth")).toBe("border-trbl-width");
    });

    it("splits between a digit and a capital", () => {
        expect(StringUtils.camelToKebabCase("grid2Columns")).toBe("grid2-columns");
    });
});

describe("StringUtils.kebabToCamelCase", () => {
    it("joins on dashes", () => {
        expect(StringUtils.kebabToCamelCase("background-color")).toBe("backgroundColor");
        expect(StringUtils.kebabToCamelCase("color")).toBe("color");
    });

    it("round-trips with camelToKebabCase", () => {
        expect(StringUtils.kebabToCamelCase(StringUtils.camelToKebabCase("borderTopLeftRadius"))).toBe(
            "borderTopLeftRadius",
        );
    });
});

describe("StringUtils.isLineBreak", () => {
    it("is true only when the whole string is breaks", () => {
        expect(StringUtils.isLineBreak("\n")).toBe(true);
        expect(StringUtils.isLineBreak("\r\n")).toBe(true);
        expect(StringUtils.isLineBreak("\n\n")).toBe(true);
        expect(StringUtils.isLineBreak("a\n")).toBe(false);
        expect(StringUtils.isLineBreak(" ")).toBe(false);
    });

    it("is false for an empty string", () => {
        expect(StringUtils.isLineBreak("")).toBe(false);
    });
});

describe("StringUtils.containsLineBreak", () => {
    it("finds a break anywhere in the string", () => {
        expect(StringUtils.containsLineBreak("a\nb")).toBe(true);
        expect(StringUtils.containsLineBreak("abc")).toBe(false);
        expect(StringUtils.containsLineBreak("")).toBe(false);
    });
});

describe("StringUtils.omitLineBreaks", () => {
    it("joins the surrounding text together", () => {
        expect(StringUtils.omitLineBreaks("a\r\nb\nc")).toBe("abc");
        expect(StringUtils.omitLineBreaks("abc")).toBe("abc");
    });
});

describe("StringUtils.splitByLinebreaks", () => {
    it("keeps breaks as entries of their own", () => {
        expect(StringUtils.splitByLinebreaks("a\nb")).toEqual(["a", "\n", "b"]);
    });

    it("keeps a Windows pair together", () => {
        expect(StringUtils.splitByLinebreaks("a\r\nb")).toEqual(["a", "\r\n", "b"]);
    });

    it("gives an empty list for an empty string", () => {
        expect(StringUtils.splitByLinebreaks("")).toEqual([]);
    });

    it("rebuilds the original when joined", () => {
        const input = "one\ntwo\r\nthree";

        expect(StringUtils.splitByLinebreaks(input).join("")).toBe(input);
    });
});

describe("StringUtils.isWhitespace", () => {
    it("is true only when the whole string is whitespace", () => {
        expect(StringUtils.isWhitespace(" ")).toBe(true);
        expect(StringUtils.isWhitespace("  \t")).toBe(true);
        expect(StringUtils.isWhitespace("a ")).toBe(false);
        expect(StringUtils.isWhitespace("")).toBe(false);
    });
});

describe("StringUtils.isClosingPunctuation", () => {
    it("recognises punctuation that hugs the word before it", () => {
        expect(StringUtils.isClosingPunctuation(".")).toBe(true);
        expect(StringUtils.isClosingPunctuation("!")).toBe(true);
        expect(StringUtils.isClosingPunctuation(")")).toBe(true);
        expect(StringUtils.isClosingPunctuation("”")).toBe(true);
    });

    it("excludes opening quotes, which attach to the next word", () => {
        expect(StringUtils.isClosingPunctuation("“")).toBe(false);
    });

    it("is false for words, spaces and empty strings", () => {
        expect(StringUtils.isClosingPunctuation("a")).toBe(false);
        expect(StringUtils.isClosingPunctuation(" ")).toBe(false);
        expect(StringUtils.isClosingPunctuation("")).toBe(false);
    });
});

describe("StringUtils.omitControlChars", () => {
    it("strips invisible characters", () => {
        expect(StringUtils.omitControlChars("a\u0000b")).toBe("ab");
        expect(StringUtils.omitControlChars("a\u0007b")).toBe("ab");
    });

    it("strips line breaks and tabs, which are control characters too", () => {
        expect(StringUtils.omitControlChars("a\nb\tc")).toBe("abc");
    });

    it("leaves ordinary text and spaces alone", () => {
        expect(StringUtils.omitControlChars("a b")).toBe("a b");
    });
});

describe("StringUtils.replaceTabs", () => {
    it("turns a tab into a single space", () => {
        expect(StringUtils.replaceTabs("a\tb")).toBe("a b");
    });

    it("drops a tab that already sits next to a space", () => {
        expect(StringUtils.replaceTabs("a \tb")).toBe("a b");
        expect(StringUtils.replaceTabs("a\t b")).toBe("a b");
    });

    it("drops vertical tabs entirely", () => {
        expect(StringUtils.replaceTabs("a\vb")).toBe("ab");
    });
});

describe("StringUtils.intlSegmentsToStrings", () => {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

    it("pulls the plain strings out", () => {
        expect(StringUtils.intlSegmentsToStrings(segmenter.segment("hi there"))).toEqual(["hi", " ", "there"]);
    });

    it("flattens several results into one list", () => {
        const segmentsArr = [segmenter.segment("hi"), segmenter.segment("there")];

        expect(StringUtils.intlSegmentsArrayToStrings(segmentsArr)).toEqual(["hi", "there"]);
    });
});

describe("StringUtils.mergePunctuation", () => {
    it("glues trailing punctuation onto the word before it", () => {
        expect(StringUtils.mergePunctuation(["Hi", "!"])).toEqual(["Hi!"]);
        expect(StringUtils.mergePunctuation(["Hi", "!", "?"])).toEqual(["Hi!?"]);
    });

    it("leaves punctuation that starts the list alone", () => {
        expect(StringUtils.mergePunctuation(["!", "Hi"])).toEqual(["!", "Hi"]);
    });

    it("leaves punctuation following a space alone", () => {
        expect(StringUtils.mergePunctuation(["Hi", " ", "!"])).toEqual(["Hi", " ", "!"]);
    });

    it("does not modify the input", () => {
        const input = ["Hi", "!"];

        StringUtils.mergePunctuation(input);

        expect(input).toEqual(["Hi", "!"]);
    });

    it("passes plain words straight through", () => {
        expect(StringUtils.mergePunctuation(["one", " ", "two"])).toEqual(["one", " ", "two"]);
    });
});
