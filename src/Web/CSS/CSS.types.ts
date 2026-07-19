type Side = "top" | "right" | "bottom" | "left";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type CSSMargin = {
    [k in `margin${Capitalize<Side>}`]: number;
};

export type CSSPadding = {
    [k in `padding${Capitalize<Side>}`]: number;
};

export type CSSBorderWidth = {
    [k in `border${Capitalize<Side>}Width`]: number;
};

export type CSSBorderRadius = {
    [k in `border${Capitalize<Corner>}Radius`]: number;
};

export type CSSCornerShape = {
    [k in `corner${Capitalize<Corner>}Shape`]: number;
};

export const CSS_TRANSFORM_KEYS = ["rotate", "scaleX", "scaleY", "skewX", "skewY", "translateX", "translateY"] as const;
export type CSSTransformKey = (typeof CSS_TRANSFORM_KEYS)[number];
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
export type CSSFilterKey = (typeof CSS_FILTER_KEYS)[number];
export type CSSAnimationKey = CSSFilterKey | CSSTransformKey;
