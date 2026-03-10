import {
    Vec2d,
    Vec2dString,
    addVec2d,
    divVec2d,
    isSameVec2d,
    mulVec2d,
    stringToVec2d,
    subVec2d,
    vec2dToString,
} from "./vec2d";

const K1 = "x";
const K2 = "y";

export type Point2d = Vec2d<typeof K1, typeof K2>;
export type Point2dString = Vec2dString<typeof K1, typeof K2>;

export namespace Point2d {
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

const PIDegrees = Math.PI / 180;

export const getMinPoint = (p1?: Point2d, p2?: Point2d): Point2d | undefined =>
    p1 !== undefined || p2 !== undefined
        ? {
              x: Math.min(p1?.x ?? Number.MAX_SAFE_INTEGER, p2?.x ?? Number.MAX_SAFE_INTEGER),
              y: Math.min(p1?.y ?? Number.MAX_SAFE_INTEGER, p2?.y ?? Number.MAX_SAFE_INTEGER),
          }
        : undefined;

export const getMaxPoint = (p1?: Point2d, p2?: Point2d): Point2d | undefined =>
    p1 !== undefined || p2 !== undefined
        ? {
              x: Math.max(p1?.x ?? Number.MIN_SAFE_INTEGER, p2?.x ?? Number.MIN_SAFE_INTEGER),
              y: Math.max(p1?.y ?? Number.MIN_SAFE_INTEGER, p2?.y ?? Number.MIN_SAFE_INTEGER),
          }
        : undefined;

export const radiansToDegrees = (radians: number): number => radians * (180 / Math.PI);

export const cylindricalToCartesian = (radius: number, angle: number): Point2d => ({
    x: radius * Math.cos(angle * PIDegrees),
    y: radius * Math.sin(angle * PIDegrees),
});

export const cartesianToCylindrical = (p: Point2d) => ({
    radius: getDistance(p),
    angle: getAngle(p),
});

export const getAngle = (p: Point2d): number => {
    let angle = 0;

    if (p.x > 0) angle = radiansToDegrees(Math.atan(p.y / p.x));
    else if (p.x < 0) angle = 180 + radiansToDegrees(Math.atan(p.y / p.x));
    else if (p.y > 0) angle = 90;
    else if (p.y < 0) angle = 270;

    return angle;
};

export const getDistance = (p: Point2d): number => Math.sqrt(p.x * p.x + p.y * p.y);

export const getNormalizedBoundaries = (start: Point2d, end: Point2d) => ({
    minX: Math.min(start.x, end.x),
    maxX: Math.max(start.x, end.x),
    minY: Math.min(start.y, end.y),
    maxY: Math.max(start.y, end.y),
});

export const hasAreaOverlap = (start1: Point2d, end1: Point2d, start2: Point2d, end2: Point2d): boolean => {
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
