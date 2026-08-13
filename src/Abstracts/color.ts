const CHANNEL_MAX = 255;
const HUE_MAX = 360;
const HUE_SECTORS = 6;
const HEX_LENGTH = 7;
const HEX_SHORT_LENGTH = 4;
const HEXA_LENGTH = 9;
const HEXA_SHORT_LENGTH = 5;
const HEXA_LENGTHS = [HEX_SHORT_LENGTH, HEXA_SHORT_LENGTH, HEX_LENGTH, HEXA_LENGTH];
const ALPHA_OPAQUE = 1;
const HEX_RADIX = 16;
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const HEXA_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const PERCENT_MAX = 100;
const PERCENT_DECIMALS = 2;
const ALPHA_DECIMALS = 3;

// GENERIC

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toChannel = (value: number) => clamp(Math.round(value), 0, CHANNEL_MAX);

const toHexPair = (value: number) => toChannel(value).toString(HEX_RADIX).padStart(2, "0");

const toHue = (value: number) => Number((((value % HUE_MAX) + HUE_MAX) % HUE_MAX).toFixed(PERCENT_DECIMALS));

const toPercent = (value: number) => `${Number((clamp(value, 0, 1) * PERCENT_MAX).toFixed(PERCENT_DECIMALS))}%`;

const toAlpha = (value: number) => Number(clamp(value, 0, ALPHA_OPAQUE).toFixed(ALPHA_DECIMALS));

/**
 * Colour values and the conversions between them.
 *
 * Every colour space gets a type describing its shape and a namespace of the same name holding
 * its operations, so `Color.HSL` is both the value and the place its functions live. Conversions
 * are named after their destination: `Color.RGB.toHsl` takes an `RGB` and returns an `HSL`.
 *
 * Spaces come in pairs. The plain form carries no transparency; the `A` form adds a required
 * `a` field, and only the `A` forms convert to each other. Inputs are clamped to their valid
 * range rather than rejected, so a nonsensical value produces the nearest sensible colour
 * instead of an error.
 */
export namespace Color {
    /** Red, green and blue, each `0`–`255`. Values may be fractional; they are rounded on output. */
    export type RGB = {
        r: number;
        g: number;
        b: number;
    };

    /** An {@link RGB} with an opacity of `0` (fully transparent) to `1` (fully opaque). */
    export type RGBA = RGB & {
        a: number;
    };

    /** Hue in degrees `0`–`360`, plus saturation and value as fractions `0`–`1`. */
    export type HSV = {
        h: number;
        s: number;
        v: number;
    };

    /** An {@link HSV} with an opacity of `0` (fully transparent) to `1` (fully opaque). */
    export type HSVA = HSV & {
        a: number;
    };

    /** Hue in degrees `0`–`360`, plus saturation and lightness as fractions `0`–`1`. */
    export type HSL = {
        h: number;
        s: number;
        l: number;
    };

    /** An {@link HSL} with an opacity of `0` (fully transparent) to `1` (fully opaque). */
    export type HSLA = HSL & {
        a: number;
    };

    /**
     * A `#` followed by 3 or 6 hexadecimal digits, such as `#f0a` or `#ff00aa`.
     *
     * Only the leading `#` is checked by the compiler — six hex digits cannot be expressed as a
     * type without enumerating every combination. Use {@link Hex.isHex} to confirm the rest.
     */
    export type Hex = `#${string}`;

    /**
     * A {@link Hex} that may also carry an alpha pair, so 3, 4, 6 or 8 digits — `#f0ac`, `#ff00aacc`.
     *
     * The alpha digits are optional: a 3 or 6 digit value is accepted and read as fully opaque.
     * As with {@link Hex}, only the leading `#` is checked by the compiler; use {@link Hexa.isHexa}
     * for the rest.
     */
    export type Hexa = `#${string}`;

    /** Names of the colour spaces that carry transparency, for callers that switch on one. */
    export type ValueSpace = "rgba" | "hsla" | "hsva" | "hexa";

    /** Operations on {@link Color.RGB} values. */
    export namespace RGB {
        /**
         * Formats the colour as a CSS `rgb()` string.
         *
         * @param rgb The colour to format.
         * @returns A string such as `rgb(255 128 0)`, with channels rounded to whole numbers.
         */
        export const toCss = (rgb: Color.RGB) => `rgb(${toChannel(rgb.r)} ${toChannel(rgb.g)} ${toChannel(rgb.b)})`;

        /**
         * Converts to a 6 digit hex string.
         *
         * @param rgb The colour to convert.
         * @returns A lowercase value such as `#ff8000`. Channels are rounded and clamped to `0`–`255`.
         */
        export const toHex = (rgb: Color.RGB): Color.Hex =>
            `#${toHexPair(rgb.r)}${toHexPair(rgb.g)}${toHexPair(rgb.b)}`;

        /**
         * Converts to hue, saturation and lightness.
         *
         * @param rgb The colour to convert.
         * @returns The same colour expressed as {@link Color.HSL}.
         */
        export const toHsl = (rgb: Color.RGB): Color.HSL => {
            const hsv = toHsv(rgb);
            const l = hsv.v * (1 - hsv.s / 2);

            return { h: hsv.h, s: l === 0 || l === 1 ? 0 : (hsv.v - l) / Math.min(l, 1 - l), l };
        };

        /**
         * Converts to hue, saturation and value.
         *
         * @param rgb The colour to convert.
         * @returns The same colour expressed as {@link Color.HSV}. Greys come back with a hue of `0`.
         */
        export const toHsv = (rgb: Color.RGB): Color.HSV => {
            const r = clamp(rgb.r, 0, CHANNEL_MAX) / CHANNEL_MAX;
            const g = clamp(rgb.g, 0, CHANNEL_MAX) / CHANNEL_MAX;
            const b = clamp(rgb.b, 0, CHANNEL_MAX) / CHANNEL_MAX;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const span = max - min;

            const sector =
                span === 0
                    ? 0
                    : max === r
                      ? ((g - b) / span + HUE_SECTORS) % HUE_SECTORS
                      : max === g
                        ? (b - r) / span + 2
                        : (r - g) / span + 4;

            return {
                h: (sector * (HUE_MAX / HUE_SECTORS) + HUE_MAX) % HUE_MAX,
                s: max === 0 ? 0 : span / max,
                v: max,
            };
        };
    }

    /** Operations on {@link Color.RGBA} values. */
    export namespace RGBA {
        /**
         * Formats the colour as a CSS `rgb()` string with an alpha component.
         *
         * @param rgba The colour to format.
         * @returns A string such as `rgb(255 128 0 / 0.5)`.
         */
        export const toCss = (rgba: Color.RGBA) =>
            `rgb(${toChannel(rgba.r)} ${toChannel(rgba.g)} ${toChannel(rgba.b)} / ${toAlpha(rgba.a)})`;

        /**
         * Converts to an 8 digit hex string.
         *
         * @param rgba The colour to convert.
         * @returns A value such as `#ff800080`. The alpha pair is always written, even when opaque.
         */
        export const toHexa = (rgba: Color.RGBA): Color.Hexa =>
            `${RGB.toHex(rgba)}${toHexPair(clamp(rgba.a, 0, ALPHA_OPAQUE) * CHANNEL_MAX)}`;

        /**
         * Converts to hue, saturation and lightness, keeping the opacity.
         *
         * @param rgba The colour to convert.
         * @returns The same colour as {@link Color.HSLA}, with alpha clamped to `0`–`1`.
         */
        export const toHsla = (rgba: Color.RGBA): Color.HSLA => ({
            ...RGB.toHsl(rgba),
            a: clamp(rgba.a, 0, ALPHA_OPAQUE),
        });

        /**
         * Converts to hue, saturation and value, keeping the opacity.
         *
         * @param rgba The colour to convert.
         * @returns The same colour as {@link Color.HSVA}, with alpha clamped to `0`–`1`.
         */
        export const toHsva = (rgba: Color.RGBA): Color.HSVA => ({
            ...RGB.toHsv(rgba),
            a: clamp(rgba.a, 0, ALPHA_OPAQUE),
        });
    }

    /** Operations on {@link Color.HSV} values. */
    export namespace HSV {
        /**
         * Formats the colour as a CSS `hwb()` string.
         *
         * CSS has no `hsv()` notation, so this uses `hwb()` — the same hue with whiteness and
         * blackness, which is HSV under another name and converts exactly. Nothing is lost, and
         * the result stays in a hue-based space rather than falling back to `rgb()`.
         *
         * @param hsv The colour to format.
         * @returns A string such as `hwb(210 7.06% 66.27%)`.
         */
        export const toCss = (hsv: Color.HSV) => {
            const s = clamp(hsv.s, 0, 1);
            const v = clamp(hsv.v, 0, 1);

            return `hwb(${toHue(hsv.h)} ${toPercent(v * (1 - s))} ${toPercent(1 - v)})`;
        };

        /**
         * Converts to red, green and blue.
         *
         * @param hsv The colour to convert. Hue wraps, so `-30` and `330` mean the same thing.
         * @returns The same colour as {@link Color.RGB}, with fractional channels.
         */
        export const toRgb = (hsv: Color.HSV): Color.RGB => {
            const h = ((hsv.h % HUE_MAX) + HUE_MAX) % HUE_MAX;
            const s = clamp(hsv.s, 0, 1);
            const v = clamp(hsv.v, 0, 1);

            const sector = h / (HUE_MAX / HUE_SECTORS);
            const offset = sector - Math.floor(sector);

            const p = v * (1 - s);
            const q = v * (1 - s * offset);
            const t = v * (1 - s * (1 - offset));

            const channels: [number, number, number][] = [
                [v, t, p],
                [q, v, p],
                [p, v, t],
                [p, q, v],
                [t, p, v],
                [v, p, q],
            ];
            const [r, g, b] = channels[Math.floor(sector) % HUE_SECTORS];

            return { r: r * CHANNEL_MAX, g: g * CHANNEL_MAX, b: b * CHANNEL_MAX };
        };

        /**
         * Converts to a 6 digit hex string.
         *
         * @param hsv The colour to convert.
         * @returns A lowercase value such as `#ff8000`.
         */
        export const toHex = (hsv: Color.HSV): Color.Hex => RGB.toHex(toRgb(hsv));

        /**
         * Converts to hue, saturation and lightness.
         *
         * @param hsv The colour to convert.
         * @returns The same colour as {@link Color.HSL}. The hue is carried across unchanged.
         */
        export const toHsl = (hsv: Color.HSV): Color.HSL => RGB.toHsl(toRgb(hsv));
    }

    /** Operations on {@link Color.HSVA} values. */
    export namespace HSVA {
        /**
         * Reads the opacity, clamped to `0`–`1`.
         *
         * @param hsva The colour to read.
         * @returns The alpha, or `1` if the field is missing at runtime.
         */
        export const getClampedAlpha = (hsva: Color.HSVA) => clamp(hsva.a ?? ALPHA_OPAQUE, 0, ALPHA_OPAQUE);

        /**
         * Formats the colour as a CSS `hwb()` string with an alpha component.
         *
         * See {@link HSV.toCss} for why this is `hwb()` rather than an HSV notation.
         *
         * @param hsva The colour to format.
         * @returns A string such as `hwb(210 7.06% 66.27% / 0.5)`.
         */
        export const toCss = (hsva: Color.HSVA) => {
            const s = clamp(hsva.s, 0, 1);
            const v = clamp(hsva.v, 0, 1);

            return `hwb(${toHue(hsva.h)} ${toPercent(v * (1 - s))} ${toPercent(1 - v)} / ${toAlpha(hsva.a)})`;
        };

        /**
         * Converts to red, green and blue, keeping the opacity.
         *
         * @param hsva The colour to convert.
         * @returns The same colour as {@link Color.RGBA}.
         */
        export const toRgba = (hsva: Color.HSVA): Color.RGBA => ({
            ...HSV.toRgb(hsva),
            a: getClampedAlpha(hsva),
        });

        /**
         * Converts to an 8 digit hex string.
         *
         * @param hsva The colour to convert.
         * @returns A value such as `#ff800080`.
         */
        export const toHexa = (hsva: Color.HSVA): Color.Hexa => RGBA.toHexa(toRgba(hsva));

        /**
         * Converts to hue, saturation and lightness, keeping the opacity.
         *
         * @param hsva The colour to convert.
         * @returns The same colour as {@link Color.HSLA}.
         */
        export const toHsla = (hsva: Color.HSVA): Color.HSLA => ({
            ...HSV.toHsl(hsva),
            a: getClampedAlpha(hsva),
        });
    }

    /** Operations on {@link Color.HSL} values. */
    export namespace HSL {
        /**
         * Formats the colour as a CSS `hsl()` string.
         *
         * @param hsl The colour to format.
         * @returns A string such as `hsl(210 65.38% 20.39%)`.
         */
        export const toCss = (hsl: Color.HSL) => `hsl(${toHue(hsl.h)} ${toPercent(hsl.s)} ${toPercent(hsl.l)})`;

        /**
         * Converts to red, green and blue.
         *
         * @param hsl The colour to convert. Hue wraps, so `-30` and `330` mean the same thing.
         * @returns The same colour as {@link Color.RGB}, with fractional channels.
         */
        export const toRgb = (hsl: Color.HSL): Color.RGB => {
            const l = clamp(hsl.l, 0, 1);
            const s = clamp(hsl.s, 0, 1);
            const v = l + s * Math.min(l, 1 - l);

            return HSV.toRgb({ h: hsl.h, s: v === 0 ? 0 : 2 * (1 - l / v), v });
        };

        /**
         * Converts to a 6 digit hex string.
         *
         * @param hsl The colour to convert.
         * @returns A lowercase value such as `#ff8000`.
         */
        export const toHex = (hsl: Color.HSL): Color.Hex => RGB.toHex(toRgb(hsl));

        /**
         * Converts to hue, saturation and value.
         *
         * @param hsl The colour to convert.
         * @returns The same colour as {@link Color.HSV}. The hue is carried across unchanged.
         */
        export const toHsv = (hsl: Color.HSL): Color.HSV => RGB.toHsv(toRgb(hsl));
    }

    /** Operations on {@link Color.HSLA} values. */
    export namespace HSLA {
        /**
         * Formats the colour as a CSS `hsl()` string with an alpha component.
         *
         * @param hsla The colour to format.
         * @returns A string such as `hsl(210 65.38% 20.39% / 0.5)`.
         */
        export const toCss = (hsla: Color.HSLA) =>
            `hsl(${toHue(hsla.h)} ${toPercent(hsla.s)} ${toPercent(hsla.l)} / ${toAlpha(hsla.a)})`;

        /**
         * Converts to red, green and blue, keeping the opacity.
         *
         * @param hsla The colour to convert.
         * @returns The same colour as {@link Color.RGBA}, with alpha clamped to `0`–`1`.
         */
        export const toRgba = (hsla: Color.HSLA): Color.RGBA => ({
            ...HSL.toRgb(hsla),
            a: clamp(hsla.a, 0, ALPHA_OPAQUE),
        });

        /**
         * Converts to an 8 digit hex string.
         *
         * @param hsla The colour to convert.
         * @returns A value such as `#ff800080`.
         */
        export const toHexa = (hsla: Color.HSLA): Color.Hexa => RGBA.toHexa(toRgba(hsla));

        /**
         * Converts to hue, saturation and value, keeping the opacity.
         *
         * @param hsla The colour to convert.
         * @returns The same colour as {@link Color.HSVA}.
         */
        export const toHsva = (hsla: Color.HSLA): Color.HSVA => RGBA.toHsva(toRgba(hsla));
    }

    /** Operations on {@link Color.Hex} values. */
    export namespace Hex {
        /**
         * Checks whether a string is a well formed hex colour without an alpha pair.
         *
         * This is the real check — the {@link Color.Hex} type only guarantees the leading `#`, so
         * anything arriving from storage, a URL or user input should pass through here first.
         *
         * @param value The string to test.
         * @returns `true` for 3 or 6 hex digits after the `#`, in either case.
         */
        export const isHex = (value: string): value is Color.Hex =>
            (value.length === HEX_LENGTH || value.length === HEX_SHORT_LENGTH) && HEX_PATTERN.test(value);

        /**
         * Compares two hex colours by the colour they describe rather than by their text.
         *
         * @param a The first colour.
         * @param b The second colour.
         * @returns `true` if both name the same colour, so `#abc` and `#aabbcc` match.
         */
        export const getIsSameHex = (a: Color.Hex, b: Color.Hex) => {
            const left = toRgb(a);
            const right = toRgb(b);

            return left.r === right.r && left.g === right.g && left.b === right.b;
        };

        /**
         * Returns the value as a CSS colour.
         *
         * @param hex The colour to format.
         * @returns The string unchanged — hex is already valid CSS.
         */
        export const toCss = (hex: Color.Hex): string => hex;

        /**
         * Converts to red, green and blue.
         *
         * @param hex A colour that has passed {@link isHex}. Short form digits are doubled, so `#f0a`
         * reads as `#ff00aa`.
         * @returns The same colour as {@link Color.RGB}.
         */
        export const toRgb = (hex: Color.Hex): Color.RGB => {
            const digits = hex.slice(1);
            const isShort = digits.length === HEX_SHORT_LENGTH - 1;
            const read = (index: number) =>
                isShort
                    ? Number.parseInt(digits[index].repeat(2), HEX_RADIX)
                    : Number.parseInt(digits.slice(index * 2, index * 2 + 2), HEX_RADIX);

            return { r: read(0), g: read(1), b: read(2) };
        };

        /**
         * Converts to hue, saturation and lightness.
         *
         * @param hex A colour that has passed {@link isHex}.
         * @returns The same colour as {@link Color.HSL}.
         */
        export const toHsl = (hex: Color.Hex): Color.HSL => RGB.toHsl(toRgb(hex));

        /**
         * Converts to hue, saturation and value.
         *
         * @param hex A colour that has passed {@link isHex}.
         * @returns The same colour as {@link Color.HSV}.
         */
        export const toHsv = (hex: Color.Hex): Color.HSV => RGB.toHsv(toRgb(hex));
    }

    /** Operations on {@link Color.Hexa} values. */
    export namespace Hexa {
        /**
         * Checks whether a string is a well formed hex colour, with or without an alpha pair.
         *
         * This is the real check — the {@link Color.Hexa} type only guarantees the leading `#`, so
         * anything arriving from storage, a URL or user input should pass through here first.
         *
         * @param value The string to test.
         * @returns `true` for 3, 4, 6 or 8 hex digits after the `#`, in either case.
         */
        export const isHexa = (value: string): value is Color.Hexa =>
            HEXA_LENGTHS.includes(value.length) && HEXA_PATTERN.test(value);

        /**
         * Compares two hex colours by the colour they describe rather than by their text.
         *
         * @param a The first colour.
         * @param b The second colour.
         * @returns `true` if both name the same colour and opacity, so `#abcf` and `#aabbccff` match,
         * and a value with no alpha pair matches the same colour written as fully opaque.
         */
        export const getIsSameHexa = (a: Color.Hexa, b: Color.Hexa) => {
            const left = toRgba(a);
            const right = toRgba(b);

            return left.r === right.r && left.g === right.g && left.b === right.b && left.a === right.a;
        };

        /**
         * Returns the value as a CSS colour.
         *
         * @param hexa The colour to format.
         * @returns The string unchanged — hex is already valid CSS.
         */
        export const toCss = (hexa: Color.Hexa): string => hexa;

        /**
         * Converts to red, green and blue, keeping the opacity.
         *
         * @param hexa A colour that has passed {@link isHexa}. Short form digits are doubled, and a
         * value with no alpha pair is read as fully opaque.
         * @returns The same colour as {@link Color.RGBA}.
         */
        export const toRgba = (hexa: Color.Hexa): Color.RGBA => {
            const digits = hexa.slice(1);
            const isShort = digits.length < HEX_LENGTH - 1;
            const size = isShort ? 1 : 2;
            const read = (index: number) => {
                const slice = digits.slice(index * size, index * size + size);

                return Number.parseInt(isShort ? slice.repeat(2) : slice, HEX_RADIX);
            };
            const hasAlpha = digits.length === HEXA_SHORT_LENGTH - 1 || digits.length === HEXA_LENGTH - 1;

            return {
                r: read(0),
                g: read(1),
                b: read(2),
                a: hasAlpha ? read(3) / CHANNEL_MAX : ALPHA_OPAQUE,
            };
        };

        /**
         * Converts to hue, saturation and lightness, keeping the opacity.
         *
         * @param hexa A colour that has passed {@link isHexa}.
         * @returns The same colour as {@link Color.HSLA}.
         */
        export const toHsla = (hexa: Color.Hexa): Color.HSLA => RGBA.toHsla(toRgba(hexa));

        /**
         * Converts to hue, saturation and value, keeping the opacity.
         *
         * @param hexa A colour that has passed {@link isHexa}.
         * @returns The same colour as {@link Color.HSVA}.
         */
        export const toHsva = (hexa: Color.Hexa): Color.HSVA => RGBA.toHsva(toRgba(hexa));
    }
}
