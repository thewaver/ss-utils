import { Point2d } from "../../Abstracts/point2d.js";
import { PolygonUtils } from "../../Abstracts/polygon.js";
import { Size2d } from "../../Abstracts/size.js";

export namespace SVGUtils {
    /**
     * Formats points for an SVG `points` attribute, as in `"0,0 10,0 10,10"`.
     *
     * @param points The corners, in order.
     */
    export const pointArrayToString = (points: Point2d[]) => PolygonUtils.pointsToSVGString(points);

    /**
     * Works out the start and end points for an SVG `linearGradient` running at a given
     * angle.
     *
     * Coordinates come back in the 0–1 range that `objectBoundingBox` gradients use, so
     * they fit any element without rescaling. `0` degrees runs left to right and angles
     * increase clockwise.
     *
     * @param angle Which way the gradient runs, in degrees. Defaults to `0`.
     * @param scale Stretches the gradient beyond the element. Values above `1` push the
     * colour stops outside the visible box, softening the ends.
     * @param offset Shifts the gradient's centre away from the middle.
     * @returns The `x1`, `y1`, `x2` and `y2` for the gradient element.
     */
    export const getLinearCoords = ({
        angle = 0,
        scale = { width: 1, height: 1 },
        offset = { x: 0, y: 0 },
    }: {
        angle?: number;
        scale?: Size2d;
        offset?: Point2d;
    }) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad);
        const y = Math.sin(rad);
        const cx = 0.5 + offset.x;
        const cy = 0.5 + offset.y;
        const halfW = 0.5 * scale.width;
        const halfH = 0.5 * scale.height;

        return {
            x1: cx - x * halfW,
            y1: cy - y * halfH,
            x2: cx + x * halfW,
            y2: cy + y * halfH,
        };
    };

    const CIRCLE_CENTER = { x: 0.5, y: 0.5 };
    const CIRCLE_RADIUS = 1;

    /**
     * Builds a pie-slice path covering part of a circle.
     *
     * The slice is drawn around a fixed unit circle, so scale it with a `viewBox` or a
     * transform rather than by passing a size.
     *
     * @param arcSize How much of the circle to cover, in degrees. Values beyond a full
     * turn wrap round; any positive whole number of turns draws a complete circle
     * rather than collapsing to nothing.
     * @param rotation Where the slice starts, in degrees.
     * @returns Path text for an SVG `d` attribute.
     */
    export const getArcPath = (arcSize: number, rotation: number = 0) => {
        const normalizedArcSize = ((arcSize % 360) + 360) % 360;
        const leadingAngle = rotation + normalizedArcSize;

        if (arcSize > 0 && normalizedArcSize === 0) {
            return (
                `M ${CIRCLE_CENTER.x} ${CIRCLE_CENTER.y} ` +
                `m 0 ${-CIRCLE_RADIUS} ` +
                `a ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 0 ${CIRCLE_RADIUS * 2} ` +
                `a ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 0 ${-CIRCLE_RADIUS * 2} Z`
            );
        }

        const startAngle = leadingAngle + 180;
        const endAngle = startAngle - normalizedArcSize;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const s = {
            x: CIRCLE_CENTER.x + CIRCLE_RADIUS * Math.cos(startRad),
            y: CIRCLE_CENTER.y + CIRCLE_RADIUS * Math.sin(startRad),
        };

        const e = {
            x: CIRCLE_CENTER.x + CIRCLE_RADIUS * Math.cos(endRad),
            y: CIRCLE_CENTER.y + CIRCLE_RADIUS * Math.sin(endRad),
        };

        const largeArcFlag = normalizedArcSize > 180 ? 1 : 0;

        return `M ${CIRCLE_CENTER.x} ${CIRCLE_CENTER.y} L ${s.x} ${s.y} A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 ${largeArcFlag} 0 ${e.x} ${e.y} Z`;
    };

    /**
     * Builds a ring of pie slices radiating from the centre of a circle, like the
     * blades of a fan or the spokes of a loading spinner.
     *
     * The slices are drawn around a fixed unit circle, so scale them with a `viewBox`
     * or a transform rather than by passing a size.
     *
     * @param count How many sectors the circle is divided into. Slices are drawn in
     * every other sector, so the gaps match the blades.
     * @param thickness How much of each sector the blade fills, from `0` to `1`. At `0`
     * nothing is drawn; at `1` or above the result is a solid circle.
     * @param rotation Where the first blade starts, in degrees.
     * @param curvature Sweeps the blades into a curve, in radians. `0` keeps them
     * straight.
     * @returns Path text for an SVG `d` attribute holding every blade.
     */
    export const getWedgesPath = (
        count: number,
        thickness: number = 0.5, // 0 - 1
        rotation: number = 0,
        curvature: number = 0,
    ) => {
        if (thickness <= 0) {
            return "";
        }

        if (thickness >= 1) {
            return [
                `M ${CIRCLE_CENTER.x + CIRCLE_RADIUS} ${CIRCLE_CENTER.y}`,
                `A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 ${CIRCLE_CENTER.x - CIRCLE_RADIUS} ${CIRCLE_CENTER.y}`,
                `A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 ${CIRCLE_CENTER.x + CIRCLE_RADIUS} ${CIRCLE_CENTER.y}`,
                "Z",
            ].join(" ");
        }

        const rad = (rotation * Math.PI) / 180;
        const sectorAngle = (Math.PI * 2) / count;
        const wedgeAngle = sectorAngle * thickness * 2;

        return Array.from({ length: count * 0.5 }, (_, i) => {
            const start = rad + i * 2 * sectorAngle;
            const end = start + wedgeAngle;
            const x0 = CIRCLE_CENTER.x + Math.cos(start + curvature) * CIRCLE_RADIUS;
            const y0 = CIRCLE_CENTER.y + Math.sin(start + curvature) * CIRCLE_RADIUS;
            const x1 = CIRCLE_CENTER.x + Math.cos(end + curvature) * CIRCLE_RADIUS;
            const y1 = CIRCLE_CENTER.y + Math.sin(end + curvature) * CIRCLE_RADIUS;
            const cp0_1x = CIRCLE_CENTER.x + Math.cos(start + curvature * 0.33) * (CIRCLE_RADIUS * 0.33);
            const cp0_1y = CIRCLE_CENTER.y + Math.sin(start + curvature * 0.33) * (CIRCLE_RADIUS * 0.33);
            const cp0_2x = CIRCLE_CENTER.x + Math.cos(start + curvature * 0.66) * (CIRCLE_RADIUS * 0.66);
            const cp0_2y = CIRCLE_CENTER.y + Math.sin(start + curvature * 0.66) * (CIRCLE_RADIUS * 0.66);
            const cp1_1x = CIRCLE_CENTER.x + Math.cos(end + curvature * 0.66) * (CIRCLE_RADIUS * 0.66);
            const cp1_1y = CIRCLE_CENTER.y + Math.sin(end + curvature * 0.66) * (CIRCLE_RADIUS * 0.66);
            const cp1_2x = CIRCLE_CENTER.x + Math.cos(end + curvature * 0.33) * (CIRCLE_RADIUS * 0.33);
            const cp1_2y = CIRCLE_CENTER.y + Math.sin(end + curvature * 0.33) * (CIRCLE_RADIUS * 0.33);
            const largeArc = wedgeAngle > Math.PI ? 1 : 0;

            return [
                `M ${CIRCLE_CENTER.x} ${CIRCLE_CENTER.y}`,
                `C ${cp0_1x} ${cp0_1y} ${cp0_2x} ${cp0_2y} ${x0} ${y0}`,
                `A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 ${largeArc} 1 ${x1} ${y1}`,
                `C ${cp1_1x} ${cp1_1y} ${cp1_2x} ${cp1_2y} ${CIRCLE_CENTER.x} ${CIRCLE_CENTER.y}`,
                "Z",
            ].join(" ");
        }).join(" ");
    };
}
