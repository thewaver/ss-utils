type Side = "top" | "right" | "bottom" | "left";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

/** Margin on all four sides, as plain numbers in pixels. */
export type CSSMargin = {
    [k in `margin${Capitalize<Side>}`]: number;
};

/** Padding on all four sides, as plain numbers in pixels. */
export type CSSPadding = {
    [k in `padding${Capitalize<Side>}`]: number;
};

/** Border width on all four sides, as plain numbers in pixels. */
export type CSSBorderWidth = {
    [k in `border${Capitalize<Side>}Width`]: number;
};

/** Corner radius on all four corners, as plain numbers in pixels. */
export type CSSBorderRadius = {
    [k in `border${Capitalize<Corner>}Radius`]: number;
};

/**
 * Corner style on all four corners.
 *
 * See {@link ShapeConst.CORNER_SHAPE_LAME_EXPONENTS} for what the numbers mean.
 */
export type CSSCornerShape = {
    [k in `corner${Capitalize<Corner>}Shape`]: number;
};

/** The individual transform functions this library can animate one at a time. */
export const CSS_TRANSFORM_KEYS = ["rotate", "scaleX", "scaleY", "skewX", "skewY", "translateX", "translateY"] as const;

/** One of {@link CSS_TRANSFORM_KEYS}. */
export type CSSTransformKey = (typeof CSS_TRANSFORM_KEYS)[number];

/** The individual filter functions this library can animate one at a time. */
export const CSS_FILTER_KEYS = [
    "blur",
    "brightness",
    "contrast",
    "grayscale",
    "hue-rotate",
    "invert",
    "opacity",
    "saturate",
] as const;

/** One of {@link CSS_FILTER_KEYS}. */
export type CSSFilterKey = (typeof CSS_FILTER_KEYS)[number];

/** Anything animatable here — a transform function or a filter function. */
export type CSSAnimationKey = CSSFilterKey | CSSTransformKey;
