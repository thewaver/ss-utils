import { Point2d, Point2dUtils } from "./point.js";

export namespace PolygonUtils {
    /**
     * Formats points for an SVG `points` attribute, as in `"0,0 10,0 10,10"`.
     *
     * @param pts The corners, in order.
     */
    export const pointsToSVGString = (pts: Point2d[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

    /**
     * Finds the unit-length direction sticking out at right angles from an edge.
     *
     * Which of the two sides it points to depends on the order of the corners, so keep
     * a consistent winding direction around the shape.
     *
     * @param p1 Start of the edge.
     * @param p2 End of the edge.
     * @returns A direction of length 1. Two identical points give `NaN`, since a
     * zero-length edge has no sides.
     */
    export const getEdgeNormal = (p1: Point2d, p2: Point2d) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);

        return {
            x: -dy / len,
            y: dx / len,
        };
    };

    /**
     * Finds where two infinite lines cross.
     *
     * Each line is given as a point plus the direction it runs in. The lines are
     * unbounded, so the crossing may land outside either stretch.
     *
     * @param p1 Any point on the first line.
     * @param dir1 Which way the first line runs.
     * @param p2 Any point on the second line.
     * @param dir2 Which way the second line runs.
     * @returns Where they cross, or `p2` if the lines run parallel and never meet.
     */
    export const getLineIntersection = (p1: Point2d, dir1: Point2d, p2: Point2d, dir2: Point2d): Point2d =>
        // Deliberately looser than the 1e-8 default: polygon edges that are nearly
        // parallel are better treated as parallel than sent off to a distant corner.
        Point2dUtils.intersectLines(p1, dir1, p2, dir2, 1e-6);

    /**
     * Pushes every edge of a polygon inwards (or outwards) by the same amount.
     *
     * Each edge is shifted sideways and neighbouring edges are extended until they
     * meet, so corners stay sharp rather than getting rounded off. Shifting further
     * than a shape can take will make thin parts turn inside out.
     *
     * @param pts The corners, in order. Never modified.
     * @param shift How far to move each edge. The sign that means "inwards" depends on
     * whether the corners run clockwise or anticlockwise.
     * @returns A new array with one corner per input corner.
     */
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
