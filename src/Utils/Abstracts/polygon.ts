import { Point2d } from "./point";

export namespace PolygonUtils {
    export const pointsSVGString = (pts: Point2d[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

    export const getEdgeNormal = (p1: Point2d, p2: Point2d) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);

        return {
            x: -dy / len,
            y: dx / len,
        };
    };

    export const getLineIntersection = (p1: Point2d, dir1: Point2d, p2: Point2d, dir2: Point2d): Point2d => {
        const cross = dir1.x * dir2.y - dir1.y * dir2.x;

        if (Math.abs(cross) < 1e-6) return p2;

        const delta = {
            x: p2.x - p1.x,
            y: p2.y - p1.y,
        };

        const t = (delta.x * dir2.y - delta.y * dir2.x) / cross;

        return {
            x: p1.x + dir1.x * t,
            y: p1.y + dir1.y * t,
        };
    };

    export function insetPolygon(pts: Point2d[], shift: number): Point2d[] {
        const count = pts.length;
        const result: Point2d[] = [];

        for (let i = 0; i < count; i++) {
            const prev = pts[(i - 1 + count) % count];
            const curr = pts[i];
            const next = pts[(i + 1) % count];

            const n1 = getEdgeNormal(prev, curr);
            const n2 = getEdgeNormal(curr, next);

            const p1 = {
                x: prev.x + n1.x * shift,
                y: prev.y + n1.y * shift,
            };
            const p2 = {
                x: curr.x + n1.x * shift,
                y: curr.y + n1.y * shift,
            };
            const p3 = {
                x: curr.x + n2.x * shift,
                y: curr.y + n2.y * shift,
            };
            const p4 = {
                x: next.x + n2.x * shift,
                y: next.y + n2.y * shift,
            };

            const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
            const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };

            result.push(getLineIntersection(p1, d1, p3, d2));
        }

        return result;
    }
}
