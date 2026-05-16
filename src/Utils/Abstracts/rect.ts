import { Point2d } from "./point";
import { Size2d } from "./size";
import { Vec4d, Vec4dString } from "./vec4d";

const K1 = "x";
const K2 = "y";
const K3 = "width";
const K4 = "height";

export type Rect = Vec4d<typeof K1, typeof K2, typeof K3, typeof K4>;
export type RectString = Vec4dString<typeof K1, typeof K2, typeof K3, typeof K4>;

export namespace Rect {
    export const min = Vec4d.min(K1, K2, K3, K4);
    export const max = Vec4d.max(K1, K2, K3, K4);
    export const add = Vec4d.add(K1, K2, K3, K4);
    export const sub = Vec4d.sub(K1, K2, K3, K4);
    export const mul = Vec4d.mul(K1, K2, K3, K4);
    export const div = Vec4d.div(K1, K2, K3, K4);
    export const isSame = Vec4d.isSame(K1, K2, K3, K4);
    export const spread = Vec4d.spread(K1, K2, K3, K4);
    export const toString = Vec4d.toString(K1, K2, K3, K4);
}

export namespace RectString {
    export const fromString = Vec4d.fromString(K1, K2, K3, K4);
}

export namespace RectUtils {
    export const fit = (fitThis: Size2d, intoThis: Size2d): Rect & { scale: number } => {
        const scale = Math.min(intoThis.width / fitThis.width, intoThis.height / fitThis.height);
        const width = fitThis.width * scale;
        const height = fitThis.height * scale;
        const x = (intoThis.width - width) * 0.5;
        const y = (intoThis.height - height) * 0.5;

        return { x, y, width, height, scale };
    };

    export const getNormalizedBounds = (start: Point2d, end: Point2d) => ({
        minX: Math.min(start.x, end.x),
        maxX: Math.max(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxY: Math.max(start.y, end.y),
    });

    export const isPointInsideRect = (point: Point2d, rect: Rect): boolean => {
        const right = rect.x + rect.width;
        const bottom = rect.y + rect.height;

        return point.x >= rect.x && point.x <= right && point.y >= rect.y && point.y <= bottom;
    };

    export const hasAreaOverlap = (a?: Rect, b?: Rect): boolean => {
        if (!a || !b) return false;

        const aRight = a.x + a.width;
        const aBottom = a.y + a.height;
        const bRight = b.x + b.width;
        const bBottom = b.y + b.height;

        return a.x <= bRight && aRight >= b.x && a.y <= bBottom && aBottom >= b.y;
    };

    export const hasAnyCornerInside = (a?: Rect, b?: Rect): boolean => {
        if (!a || !b) return false;

        const aRight = a.x + a.width;
        const aBottom = a.y + a.height;
        const bRight = b.x + b.width;
        const bBottom = b.y + b.height;

        return (
            isPointInsideRect({ x: a.x, y: a.y }, b) ||
            isPointInsideRect({ x: a.x, y: aBottom }, b) ||
            isPointInsideRect({ x: aRight, y: aBottom }, b) ||
            isPointInsideRect({ x: aRight, y: a.y }, b) ||
            isPointInsideRect({ x: b.x, y: b.y }, a) ||
            isPointInsideRect({ x: b.x, y: bBottom }, a) ||
            isPointInsideRect({ x: bRight, y: bBottom }, a) ||
            isPointInsideRect({ x: bRight, y: b.y }, a)
        );
    };
}
