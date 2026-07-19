import type * as CSS from "csstype";

import { CssConst } from "../../../CSS/CSS.const";

export type TextMetricValue = 0 | (string & {});
export type TextMetricKey = (typeof CssConst.CSS_KEYS_USED_TO_MEASURE_TEXT)[number];
export type TextMetricsStyle = Pick<CSS.PropertiesHyphen, TextMetricKey>;
export type TextNonMetricStyle = Omit<CSS.PropertiesHyphen, TextMetricKey>;
