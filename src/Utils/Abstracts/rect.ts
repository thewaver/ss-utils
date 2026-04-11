import { Point2d } from "./point";
import { Size2d } from "./size";

export type Rect = Point2d & Size2d;

export namespace Rect {
    export const isSame = (a?: Rect, b?: Rect): boolean =>
        !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

    export const fit = (fitThis: Size2d, intoThis: Size2d): Rect & { scale: number } => {
        const scale = Math.min(intoThis.width / fitThis.width, intoThis.height / fitThis.height);
        const width = fitThis.width * scale;
        const height = fitThis.height * scale;
        const x = (intoThis.width - width) * 0.5;
        const y = (intoThis.height - height) * 0.5;

        return { width, height, x, y, scale };
    };

    export const getNormalizedBoundaries = (start: Point2d, end: Point2d) => ({
        minX: Math.min(start.x, end.x),
        maxX: Math.max(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxY: Math.max(start.y, end.y),
    });

    export const hasAreaOverlap = (start1: Point2d, end1: Point2d, start2: Point2d, end2: Point2d): boolean =>
        start1.x <= end2.x && end1.x >= start2.x && start1.y <= end2.y && end1.y >= start2.y;

    export const hasAnyCornerInside = (start1: Point2d, end1: Point2d, start2: Point2d, end2: Point2d): boolean => {
        const corners1 = [
            { x: start1.x, y: start1.y },
            { x: start1.x, y: end1.y },
            { x: end1.x, y: end1.y },
            { x: end1.x, y: start1.y },
        ];

        for (const corner of corners1)
            if (corner.x >= start2.x && corner.x <= end2.x && corner.y >= start2.y && corner.y <= end2.y) return true;

        // check twice to account for points
        const corners2 = [
            { x: start2.x, y: start2.y },
            { x: start2.x, y: end2.y },
            { x: end2.x, y: end2.y },
            { x: end2.x, y: start2.y },
        ];

        for (const corner of corners2)
            if (corner.x >= start1.x && corner.x <= end1.x && corner.y >= start1.y && corner.y <= end1.y) return true;

        return false;
    };
}
