import { Point2d } from "../../Abstracts/point";

export namespace DOMUtils {
    export const offsetDOMRect = (rect: DOMRect | undefined, offset: Point2d | undefined): DOMRect | undefined => {
        if (!rect || !offset) return rect;

        return {
            ...rect,
            x: rect.x - offset.x,
            y: rect.y - offset.y,
            bottom: rect.bottom - offset.y,
            left: rect.left - offset.x,
            right: rect.right - offset.x,
            top: rect.top - offset.y,
            width: rect.width,
            height: rect.height,
        };
    };

    export const scaleDOMRect = (rect: DOMRect | undefined, scale: number): DOMRect | undefined => {
        if (!rect) return rect;

        return {
            ...rect,
            x: rect.x * scale,
            y: rect.y * scale,
            bottom: rect.bottom * scale,
            left: rect.left * scale,
            right: rect.right * scale,
            top: rect.top * scale,
            width: rect.width * scale,
            height: rect.height * scale,
        };
    };
}
