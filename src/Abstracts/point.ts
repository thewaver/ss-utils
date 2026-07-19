import { Vec2d, Vec2dString } from "./vec2d";

const K1 = "x";
const K2 = "y";
const PIDegrees = Math.PI / 180;

export type Point2d = Vec2d<typeof K1, typeof K2>;
export type Point2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Point2d {
    export const min = Vec2d.min(K1, K2);
    export const max = Vec2d.max(K1, K2);
    export const add = Vec2d.add(K1, K2);
    export const sub = Vec2d.sub(K1, K2);
    export const mul = Vec2d.mul(K1, K2);
    export const div = Vec2d.div(K1, K2);
    export const isSame = Vec2d.isSame(K1, K2);
    export const toString = Vec2d.toString(K1, K2);
}

export namespace Point2dString {
    export const fromString = Vec2d.fromString(K1, K2);
}

export namespace Point2dUtils {
    export const radiansToDegrees = (radians: number): number => radians * (180 / Math.PI);

    export const getNormal = (p: Point2d): Point2d => {
        const dist = getDistance(p);

        return dist === 0 ? { x: 0, y: 0 } : { x: p.x / dist, y: p.y / dist };
    };

    export const getPrependicular = (p: Point2d): Point2d => ({ x: -p.y, y: p.x });

    export const getDistance = (p: Point2d): number => Math.hypot(p.x, p.y);

    export const getAngle = (p: Point2d): number => {
        let angle = 0;

        if (p.x > 0) angle = radiansToDegrees(Math.atan(p.y / p.x));
        else if (p.x < 0) angle = 180 + radiansToDegrees(Math.atan(p.y / p.x));
        else if (p.y > 0) angle = 90;
        else if (p.y < 0) angle = 270;

        return angle;
    };

    export const polarToCartesian = (radius: number, angle: number): Point2d => ({
        x: radius * Math.cos(angle * PIDegrees),
        y: radius * Math.sin(angle * PIDegrees),
    });

    export const cartesianToPolar = (p: Point2d) => ({
        radius: getDistance(p),
        angle: getAngle(p),
    });

    export const intersectEdges = (start1: Point2d, end1: Point2d, start2: Point2d, end2: Point2d): Point2d => {
        const cross = end1.x * end2.y - end1.y * end2.x;

        if (Math.abs(cross) < 1e-8) return start2;

        const qp = Point2d.sub(start2, start1);
        const t = (qp.x * end2.y - qp.y * end2.x) / cross;

        return Point2d.add(start1, Point2d.mul(end1, { x: t, y: t }));
    };

    export const offsetEdge = (a: Point2d, b: Point2d, offset: number) => {
        const d = getNormal(Point2d.sub(b, a));
        const n = getPrependicular(d);
        const o = Point2d.mul(n, { x: offset, y: offset });

        return {
            a: Point2d.add(a, o),
            b: Point2d.add(b, o),
        };
    };
}
