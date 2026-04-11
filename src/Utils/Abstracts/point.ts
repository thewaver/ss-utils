import {
    Vec2d,
    Vec2dString,
    addVec2d,
    divVec2d,
    isSameVec2d,
    maxVec2d,
    minVec2d,
    mulVec2d,
    stringToVec2d,
    subVec2d,
    vec2dToString,
} from "./vec2d";

const K1 = "x";
const K2 = "y";
const PIDegrees = Math.PI / 180;

export type Point2d = Vec2d<typeof K1, typeof K2>;
export type Point2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Point2d {
    export const min = minVec2d(K1, K2);
    export const max = maxVec2d(K1, K2);
    export const add = addVec2d(K1, K2);
    export const sub = subVec2d(K1, K2);
    export const mul = mulVec2d(K1, K2);
    export const div = divVec2d(K1, K2);
    export const isSame = isSameVec2d(K1, K2);
    export const toString = vec2dToString(K1, K2);
}

export namespace Point2dString {
    export const toPoint2d = stringToVec2d(K1, K2);
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
