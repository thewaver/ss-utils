import { Point2d } from "../../Abstracts/point2d.js";

export namespace DOMUtils {
    /**
     * Shifts a measured rectangle by an offset.
     *
     * `getBoundingClientRect` reports positions relative to the viewport. Subtracting a
     * container's own position converts those into positions relative to that
     * container.
     *
     * @param rect The rectangle to shift. Returned untouched if missing.
     * @param offset How far to shift it. Returned untouched if missing.
     * @returns A new `DOMRect`. The original is not modified.
     */
    export const offsetDOMRect = (rect: DOMRect | undefined, offset: Point2d | undefined): DOMRect | undefined => {
        if (!rect || !offset) return rect;

        return DOMRect.fromRect({
            x: rect.x - offset.x,
            y: rect.y - offset.y,
            width: rect.width,
            height: rect.height,
        });
    };

    /**
     * Scales a measured rectangle about the origin.
     *
     * Both the position and the size are scaled, which is what converts a measurement
     * taken on screen into the coordinates of a zoomed or transformed canvas.
     *
     * @param rect The rectangle to scale. Returned untouched if missing.
     * @param scale What to multiply by.
     * @returns A new `DOMRect`. The original is not modified.
     */
    export const scaleDOMRect = (rect: DOMRect | undefined, scale: number): DOMRect | undefined => {
        if (!rect) return rect;

        return DOMRect.fromRect({
            x: rect.x * scale,
            y: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
        });
    };
}
