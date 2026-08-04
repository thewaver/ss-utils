import type * as CSS from "csstype";

import { CSSConst } from "../../../CSS/CSS.const.js";

/**
 * A CSS value used in text measurement.
 *
 * `0` is allowed unitless, matching CSS; everything else is a string such as `"16px"`.
 */
export type TextMetricValue = 0 | (string & {});

/** The name of a CSS property that changes how wide text comes out. */
export type TextMetricKey = (typeof CSSConst.CSS_KEYS_USED_TO_MEASURE_TEXT)[number];

/** Just the CSS properties that change how wide text comes out — font, spacing and case. */
export type TextMetricsStyle = Pick<CSS.PropertiesHyphen, TextMetricKey>;

/**
 * Every other CSS property — the ones that change how text looks without changing its
 * size.
 *
 * Splitting styles this way means a measurement only has to consider the handful of
 * properties that can actually affect it.
 */
export type TextNonMetricStyle = Omit<CSS.PropertiesHyphen, TextMetricKey>;
