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

    export const getDistance = (p: Point2d): number => Math.sqrt(p.x * p.x + p.y * p.y);

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
}
