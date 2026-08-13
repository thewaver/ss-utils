import { describe, expect, it } from "vitest";

import { Color } from "../../src/Abstracts/color.js";

const RED: Color.Hex = "#ff0000";
const GREEN: Color.Hex = "#00ff00";
const BLUE: Color.Hex = "#0000ff";
const GREY: Color.Hex = "#808080";
const NAVY: Color.Hex = "#123456";

const round = (rgb: Color.RGB) => ({
    r: Math.round(rgb.r),
    g: Math.round(rgb.g),
    b: Math.round(rgb.b),
});

describe("Color.RGB.toHex", () => {
    it("writes six lowercase digits", () => {
        expect(Color.RGB.toHex({ r: 255, g: 0, b: 0 })).toBe(RED);
        expect(Color.RGB.toHex({ r: 18, g: 52, b: 86 })).toBe(NAVY);
    });

    it("pads single digit channels", () => {
        expect(Color.RGB.toHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
        expect(Color.RGB.toHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
    });

    it("rounds and clamps out of range channels", () => {
        expect(Color.RGB.toHex({ r: 127.6, g: -20, b: 300 })).toBe("#8000ff");
    });
});

describe("Color.Hex.toRgb", () => {
    it("reads the six digit form", () => {
        expect(Color.Hex.toRgb(NAVY)).toEqual({ r: 18, g: 52, b: 86 });
    });

    it("doubles the digits of the three digit form", () => {
        expect(Color.Hex.toRgb("#f0a")).toEqual({ r: 255, g: 0, b: 170 });
        expect(Color.Hex.toRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("accepts uppercase", () => {
        expect(Color.Hex.toRgb("#FF00AA")).toEqual(Color.Hex.toRgb("#ff00aa"));
    });
});

describe("Color.RGB.toHsv", () => {
    it("places the primaries on their hue", () => {
        expect(Color.Hex.toHsv(RED)).toEqual({ h: 0, s: 1, v: 1 });
        expect(Color.Hex.toHsv(GREEN)).toEqual({ h: 120, s: 1, v: 1 });
        expect(Color.Hex.toHsv(BLUE)).toEqual({ h: 240, s: 1, v: 1 });
    });

    it("reports greys as unsaturated with a hue of zero", () => {
        const grey = Color.Hex.toHsv(GREY);

        expect(grey.s).toBe(0);
        expect(grey.h).toBe(0);
        expect(grey.v).toBeCloseTo(0.502, 3);
    });

    it("reports black as fully dark", () => {
        expect(Color.Hex.toHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
    });
});

describe("Color.RGB.toHsl", () => {
    it("places the primaries at half lightness", () => {
        expect(Color.Hex.toHsl(RED)).toEqual({ h: 0, s: 1, l: 0.5 });
        expect(Color.Hex.toHsl(GREEN)).toEqual({ h: 120, s: 1, l: 0.5 });
    });

    it("reports white and black as unsaturated", () => {
        expect(Color.Hex.toHsl("#ffffff")).toEqual({ h: 0, s: 0, l: 1 });
        expect(Color.Hex.toHsl("#000000")).toEqual({ h: 0, s: 0, l: 0 });
    });
});

describe("Color hue wrapping", () => {
    it("treats hues outside 0-360 as their wrapped equivalent", () => {
        const base = Color.HSV.toRgb({ h: 30, s: 1, v: 1 });

        expect(Color.HSV.toRgb({ h: 390, s: 1, v: 1 })).toEqual(base);
        expect(Color.HSV.toRgb({ h: -330, s: 1, v: 1 })).toEqual(base);
    });

    it("wraps the hue in HSL as well", () => {
        expect(Color.HSL.toRgb({ h: 390, s: 1, l: 0.5 })).toEqual(Color.HSL.toRgb({ h: 30, s: 1, l: 0.5 }));
    });
});

describe("Color clamping", () => {
    it("clamps saturation and value that fall outside 0-1", () => {
        expect(round(Color.HSV.toRgb({ h: 0, s: 5, v: 5 }))).toEqual({ r: 255, g: 0, b: 0 });
        expect(round(Color.HSV.toRgb({ h: 0, s: -1, v: -1 }))).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("clamps alpha on the way in and out", () => {
        expect(Color.RGBA.toHsva({ r: 0, g: 0, b: 0, a: 4 }).a).toBe(1);
        expect(Color.RGBA.toHsva({ r: 0, g: 0, b: 0, a: -4 }).a).toBe(0);
        expect(Color.RGBA.toHexa({ r: 0, g: 0, b: 0, a: 4 })).toBe("#000000ff");
    });
});

describe("Color round trips", () => {
    const samples: Color.Hex[] = [RED, GREEN, BLUE, GREY, NAVY, "#ffffff", "#000000", "#7f3d19"];

    it("survives hex to HSV and back", () => {
        for (const hex of samples) expect(Color.HSV.toHex(Color.Hex.toHsv(hex))).toBe(hex);
    });

    it("survives hex to HSL and back", () => {
        for (const hex of samples) expect(Color.HSL.toHex(Color.Hex.toHsl(hex))).toBe(hex);
    });

    it("survives HSV to HSL and back", () => {
        for (const hex of samples) expect(Color.HSL.toHex(Color.HSV.toHsl(Color.Hex.toHsv(hex)))).toBe(hex);
    });

    it("keeps the alpha channel through every space", () => {
        const hexa: Color.Hexa = "#3366cc80";

        expect(Color.RGBA.toHexa(Color.Hexa.toRgba(hexa))).toBe(hexa);
        expect(Color.HSVA.toHexa(Color.Hexa.toHsva(hexa))).toBe(hexa);
        expect(Color.HSLA.toHexa(Color.Hexa.toHsla(hexa))).toBe(hexa);
        expect(Color.HSVA.toHexa(Color.HSLA.toHsva(Color.Hexa.toHsla(hexa)))).toBe(hexa);
        expect(Color.HSLA.toHexa(Color.HSVA.toHsla(Color.Hexa.toHsva(hexa)))).toBe(hexa);
    });
});

describe("Color.Hexa.toRgba", () => {
    it("reads the alpha pair", () => {
        expect(Color.Hexa.toRgba("#3366cc00").a).toBe(0);
        expect(Color.Hexa.toRgba("#3366ccff").a).toBe(1);
        expect(Color.Hexa.toRgba("#3366cc80").a).toBeCloseTo(0.502, 3);
    });

    it("treats a missing alpha pair as fully opaque", () => {
        expect(Color.Hexa.toRgba("#3366cc").a).toBe(1);
        expect(Color.Hexa.toRgba("#36c").a).toBe(1);
    });

    it("doubles the digits of the four digit form", () => {
        expect(Color.Hexa.toRgba("#36cf")).toEqual(Color.Hexa.toRgba("#3366ccff"));
    });
});

describe("Color.RGBA.toHexa", () => {
    it("always writes the alpha pair", () => {
        expect(Color.RGBA.toHexa({ r: 51, g: 102, b: 204, a: 1 })).toBe("#3366ccff");
        expect(Color.RGBA.toHexa({ r: 51, g: 102, b: 204, a: 0 })).toBe("#3366cc00");
    });
});

describe("Color.Hex.isHex", () => {
    it("accepts the three and six digit forms in either case", () => {
        expect(Color.Hex.isHex("#abc")).toBe(true);
        expect(Color.Hex.isHex("#aabbcc")).toBe(true);
        expect(Color.Hex.isHex("#AABBCC")).toBe(true);
    });

    it("rejects bad characters, wrong lengths and a missing hash", () => {
        expect(Color.Hex.isHex("#abg")).toBe(false);
        expect(Color.Hex.isHex("#abcde")).toBe(false);
        expect(Color.Hex.isHex("aabbcc")).toBe(false);
        expect(Color.Hex.isHex("")).toBe(false);
    });

    it("rejects the forms that carry an alpha pair", () => {
        expect(Color.Hex.isHex("#abcd")).toBe(false);
        expect(Color.Hex.isHex("#aabbccdd")).toBe(false);
    });
});

describe("Color.Hexa.isHexa", () => {
    it("accepts all four lengths, with or without an alpha pair", () => {
        expect(Color.Hexa.isHexa("#abc")).toBe(true);
        expect(Color.Hexa.isHexa("#abcd")).toBe(true);
        expect(Color.Hexa.isHexa("#aabbcc")).toBe(true);
        expect(Color.Hexa.isHexa("#aabbccdd")).toBe(true);
    });

    it("rejects bad characters, wrong lengths and a missing hash", () => {
        expect(Color.Hexa.isHexa("#abcg")).toBe(false);
        expect(Color.Hexa.isHexa("#aabbc")).toBe(false);
        expect(Color.Hexa.isHexa("aabbccdd")).toBe(false);
        expect(Color.Hexa.isHexa("")).toBe(false);
    });
});

describe("Color.Hex.getIsSameHex", () => {
    it("matches the short and long forms of one colour", () => {
        expect(Color.Hex.getIsSameHex("#abc", "#aabbcc")).toBe(true);
        expect(Color.Hex.getIsSameHex("#ABC", "#aabbcc")).toBe(true);
    });

    it("separates different colours", () => {
        expect(Color.Hex.getIsSameHex("#abc", "#abd")).toBe(false);
    });
});

describe("Color.Hexa.getIsSameHexa", () => {
    it("matches the short and long forms of one colour", () => {
        expect(Color.Hexa.getIsSameHexa("#abcf", "#aabbccff")).toBe(true);
    });

    it("treats a missing alpha pair as fully opaque", () => {
        expect(Color.Hexa.getIsSameHexa("#aabbcc", "#aabbccff")).toBe(true);
    });

    it("separates colours that differ only in opacity", () => {
        expect(Color.Hexa.getIsSameHexa("#aabbcc", "#aabbcc80")).toBe(false);
    });
});

describe("Color.HSVA.getClampedAlpha", () => {
    it("clamps to 0-1", () => {
        expect(Color.HSVA.getClampedAlpha({ h: 0, s: 0, v: 0, a: 4 })).toBe(1);
        expect(Color.HSVA.getClampedAlpha({ h: 0, s: 0, v: 0, a: -4 })).toBe(0);
        expect(Color.HSVA.getClampedAlpha({ h: 0, s: 0, v: 0, a: 0.25 })).toBe(0.25);
    });
});

describe("Color toCss", () => {
    it("writes each space in its own notation", () => {
        const rgb = Color.Hex.toRgb(NAVY);

        expect(Color.RGB.toCss(rgb)).toBe("rgb(18 52 86)");
        expect(Color.HSL.toCss(Color.RGB.toHsl(rgb))).toBe("hsl(210 65.38% 20.39%)");
        expect(Color.HSV.toCss(Color.RGB.toHsv(rgb))).toBe("hwb(210 7.06% 66.27%)");
    });

    it("appends the alpha component for the transparent spaces", () => {
        const rgba = Color.Hexa.toRgba("#3366cc80");

        expect(Color.RGBA.toCss(rgba)).toBe("rgb(51 102 204 / 0.502)");
        expect(Color.HSLA.toCss(Color.RGBA.toHsla(rgba))).toBe("hsl(220 60% 50% / 0.502)");
        expect(Color.HSVA.toCss(Color.RGBA.toHsva(rgba))).toBe("hwb(220 20% 20% / 0.502)");
    });

    it("passes hex through unchanged", () => {
        expect(Color.Hex.toCss(NAVY)).toBe(NAVY);
        expect(Color.Hexa.toCss("#3366cc80")).toBe("#3366cc80");
    });

    it("rounds channels and clamps alpha", () => {
        expect(Color.RGB.toCss({ r: 17.6, g: -5, b: 300 })).toBe("rgb(18 0 255)");
        expect(Color.RGBA.toCss({ r: 0, g: 0, b: 0, a: 4 })).toBe("rgb(0 0 0 / 1)");
    });

    it("describes white and black in every space", () => {
        expect(Color.HSV.toCss({ h: 0, s: 0, v: 1 })).toBe("hwb(0 100% 0%)");
        expect(Color.HSV.toCss({ h: 0, s: 0, v: 0 })).toBe("hwb(0 0% 100%)");
        expect(Color.HSL.toCss({ h: 0, s: 0, l: 1 })).toBe("hsl(0 0% 100%)");
    });
});
