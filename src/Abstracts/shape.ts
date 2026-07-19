import type * as CSS from "csstype";

import { ObjectUtils } from "./object";
import { Point2d } from "./point";
import { Size2d } from "./size";

export namespace ShapeConst {
    export const DEFAULT_SHAPES = [
        "triangle-up",
        "triangle-down",
        "square",
        "lozenge",
        "hexagon-pointy-top",
        "hexagon-flat-top",
    ] as const;
    export type DefaultShape = (typeof DEFAULT_SHAPES)[number];

    export const CORNER_SHAPE_LAME_EXPONENTS = {
        square: Infinity,
        squircle: 2,
        round: 1,
        bevel: 0,
        scoop: -1,
        notch: -Infinity,
    };

    export const getDefaultShapePoints = (shape: DefaultShape, { width, height }: Size2d): Point2d[] => {
        switch (shape) {
            case "triangle-up":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height },
                    { x: 0, y: height },
                ];

            case "triangle-down":
                return [
                    { x: 0, y: 0 },
                    { x: width, y: 0 },
                    { x: width * 0.5, y: height },
                ];

            case "square":
                return [
                    { x: 0, y: 0 },
                    { x: width, y: 0 },
                    { x: width, y: height },
                    { x: 0, y: height },
                ];

            case "lozenge":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.5 },
                ];

            case "hexagon-pointy-top":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.25 },
                    { x: width, y: height * 0.75 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.75 },
                    { x: 0, y: height * 0.25 },
                ];

            case "hexagon-flat-top":
                return [
                    { x: width * 0.25, y: 0 },
                    { x: width * 0.75, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: width * 0.75, y: height },
                    { x: width * 0.25, y: height },
                    { x: 0, y: height * 0.5 },
                ];
        }
    };
}

export namespace ShapeUtils {
    const INNER_RECT_ITERATIONS = 5;
    const INNER_RECT_SAMPLES = 50;
    const CIRCLE_KAPPA = 1;
    const HALF_PI = Math.PI * 0.5;

    type ShapePaths = {
        innerPath: string;
        innerPoints: Point2d[];
        outerPath: string;
        outerPoints: Point2d[];
    };

    export const PATH_CACHE: Record<string, ShapePaths> = {};

    export const pointsToPath = (pts: Point2d[]) => {
        if (pts.length < 3) return "";

        let path = `M ${pts[0].x} ${pts[0].y}`;

        for (let idx = 1; idx < pts.length; idx++) {
            path += `L ${pts[idx].x} ${pts[idx].y}`;
        }

        return path + "Z";
    };

    export const getInnerRect = (pts: Point2d[]) => {
        if (pts.length < 3) return { x: 0, y: 0, width: 0, height: 0 };

        let yMin = Infinity;
        let yMax = -Infinity;

        for (const p of pts) {
            if (p.y < yMin) yMin = p.y;
            if (p.y > yMax) yMax = p.y;
        }

        const getXBounds = (y: number) => {
            let xMin = Infinity,
                xMax = -Infinity;

            for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
                const p1 = pts[i],
                    p2 = pts[j];

                if ((p1.y <= y && p2.y >= y) || (p2.y <= y && p1.y >= y)) {
                    if (p1.y === p2.y) {
                        xMin = Math.min(xMin, p1.x, p2.x);
                        xMax = Math.max(xMax, p1.x, p2.x);
                    } else {
                        const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
                        xMin = Math.min(xMin, x);
                        xMax = Math.max(xMax, x);
                    }
                }
            }

            return { xMin, xMax };
        };

        let bestRect = { x: 0, y: 0, width: 0, height: 0, area: 0 };
        let yB_min = yMin;
        let yB_max = yMax;
        let yT_min = yMin;
        let yT_max = yMax;

        for (let iter = 0; iter < INNER_RECT_ITERATIONS; iter++) {
            let currentBest = { ...bestRect };

            const stepB = (yB_max - yB_min) / INNER_RECT_SAMPLES;
            const stepT = (yT_max - yT_min) / INNER_RECT_SAMPLES;
            const bVals = [],
                tVals = [];

            for (let i = 0; i <= INNER_RECT_SAMPLES; i++) {
                const yB = yB_min + i * stepB;
                const yT = yT_min + i * stepT;
                bVals.push({ y: yB, bounds: getXBounds(yB) });
                tVals.push({ y: yT, bounds: getXBounds(yT) });
            }

            for (let i = 0; i <= INNER_RECT_SAMPLES; i++) {
                for (let j = 0; j <= INNER_RECT_SAMPLES; j++) {
                    const yB = bVals[i].y;
                    const yT = tVals[j].y;

                    if (yT <= yB) continue;

                    const bB = bVals[i].bounds;
                    const bT = tVals[j].bounds;
                    const xL = Math.max(bB.xMin, bT.xMin);
                    const xR = Math.min(bB.xMax, bT.xMax);

                    if (xR > xL) {
                        const area = (xR - xL) * (yT - yB);
                        if (area > currentBest.area) {
                            currentBest = {
                                x: xL,
                                y: yB,
                                width: xR - xL,
                                height: yT - yB,
                                area,
                            };
                        }
                    }
                }
            }

            if (currentBest.area === 0) break;

            bestRect = currentBest;

            const rangeB = (yB_max - yB_min) * 0.2;
            const rangeT = (yT_max - yT_min) * 0.2;

            yB_min = Math.max(yMin, bestRect.y - rangeB);
            yB_max = Math.min(yMax, bestRect.y + rangeB);
            yT_min = Math.max(yMin, bestRect.y + bestRect.height - rangeT);
            yT_max = Math.min(yMax, bestRect.y + bestRect.height + rangeT);
        }

        return {
            x: bestRect.x,
            y: bestRect.y,
            width: bestRect.width,
            height: bestRect.height,
        };
    };

    export const setupPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        joinRadii?: number[],
        lameExponents?: number[],
        offset: number = 0,
    ) => {
        const vertexCount = vertices.length;

        const common = {
            edgeThicknesses: ObjectUtils.padArray(edgeThicknesses, 0, vertexCount),
            lameExponents: ObjectUtils.padArray(lameExponents ?? [], CIRCLE_KAPPA, vertexCount),
        };

        const hasThickness = common.edgeThicknesses.some((t) => t !== 0);
        const rawJoinRadii = ObjectUtils.padArray(joinRadii ?? [], 0, vertexCount);
        const hasRadii = rawJoinRadii.some((r) => r > 0);

        const outer = {
            vertices: [] as Point2d[],
            joinRadii: [] as number[],
        };

        const inner = {
            vertices: [] as Point2d[],
            joinRadii: [] as number[],
        };

        const vectors = {
            unitTangents: [] as Point2d[],
            unitNormals: [] as Point2d[],
            crossChecks: [] as number[],
        };

        if (vertexCount < 3) return { outer, inner, common, vectors, hasThickness, hasRadii };

        if (!hasRadii) {
            outer.joinRadii = rawJoinRadii;
        } else {
            const edgeScaleFactors = new Array(vertexCount).fill(1);

            for (let i = 0; i < vertexCount; i++) {
                const nextIndex = ObjectUtils.getNextArrayIndex(i, vertexCount);
                const edgeLength = Math.hypot(
                    vertices[nextIndex].x - vertices[i].x,
                    vertices[nextIndex].y - vertices[i].y,
                );
                const thickness = common.edgeThicknesses[i];
                const rCurrent = rawJoinRadii[i];
                const rNext = rawJoinRadii[nextIndex];
                const kCurrent = common.lameExponents[i];
                const kNext = common.lameExponents[nextIndex];
                const thicknessOverhead = (kCurrent < 0 ? thickness : 0) + (kNext < 0 ? thickness : 0);
                const availableRadiusSpace = Math.max(0, edgeLength - thicknessOverhead);
                const rawRadiiSum = rCurrent + rNext;

                if (availableRadiusSpace === 0) {
                    edgeScaleFactors[i] = 0;
                } else if (rawRadiiSum > availableRadiusSpace && rawRadiiSum > 0) {
                    edgeScaleFactors[i] = availableRadiusSpace / rawRadiiSum;
                }
            }

            outer.joinRadii = rawJoinRadii.map((r, i) => {
                const prevEdgeIndex = (i - 1 + vertexCount) % vertexCount;
                const currEdgeIndex = i;
                const strictFactor = Math.min(edgeScaleFactors[prevEdgeIndex], edgeScaleFactors[currEdgeIndex]);

                return r * strictFactor;
            });
        }

        const { totalX, totalY } = vertices.reduce(
            (acc, curr) => ({ totalX: acc.totalX + curr.x, totalY: acc.totalY + curr.y }),
            { totalX: 0, totalY: 0 },
        );
        const polygonCenter = { x: totalX / vertexCount, y: totalY / vertexCount };

        for (let i = 0; i < vertexCount; i++) {
            const curr = vertices[i];
            const next = vertices[ObjectUtils.getNextArrayIndex(i, vertexCount)];
            const deltaX = next.x - curr.x;
            const deltaY = next.y - curr.y;
            const edgeLength = Math.hypot(deltaX, deltaY);
            const vectorToMidpoint = {
                x: (curr.x + next.x) * 0.5 - polygonCenter.x,
                y: (curr.y + next.y) * 0.5 - polygonCenter.y,
            };
            const tangent = { x: deltaX / edgeLength, y: deltaY / edgeLength };

            vectors.unitTangents.push(tangent);

            let normal = { x: -tangent.y, y: tangent.x };
            if (normal.x * vectorToMidpoint.x + normal.y * vectorToMidpoint.y < 0) {
                normal = { x: tangent.y, y: -tangent.x };
            }
            vectors.unitNormals.push(normal);
        }

        for (let i = 0; i < vertexCount; i++) {
            const prevIndex = ObjectUtils.getPrevArrayIndex(i, vertexCount);
            const vertex = vertices[i];
            const prevTangent = vectors.unitTangents[prevIndex];
            const currTangent = vectors.unitTangents[i];
            const prevNormal = vectors.unitNormals[prevIndex];
            const currNormal = vectors.unitNormals[i];
            const crossCheck = prevTangent.x * currTangent.y - prevTangent.y * currTangent.x || 0.001;
            vectors.crossChecks.push(crossCheck);

            const prevOuterWall = { x: vertex.x + offset * prevNormal.x, y: vertex.y + offset * prevNormal.y };
            const currOuterWall = { x: vertex.x + offset * currNormal.x, y: vertex.y + offset * currNormal.y };
            const outerScale =
                ((currOuterWall.x - prevOuterWall.x) * currTangent.y -
                    (currOuterWall.y - prevOuterWall.y) * currTangent.x) /
                crossCheck;

            outer.vertices.push({
                x: prevOuterWall.x + outerScale * prevTangent.x,
                y: prevOuterWall.y + outerScale * prevTangent.y,
            });

            if (!hasThickness && offset === 0) {
                inner.vertices.push({ x: vertex.x, y: vertex.y });
                inner.joinRadii.push(outer.joinRadii[i]);
            } else {
                const prevThickness = common.edgeThicknesses[prevIndex];
                const currThickness = common.edgeThicknesses[i];
                const prevInnerWall = {
                    x: vertex.x - prevThickness * prevNormal.x,
                    y: vertex.y - prevThickness * prevNormal.y,
                };
                const currInnerWall = {
                    x: vertex.x - currThickness * currNormal.x,
                    y: vertex.y - currThickness * currNormal.y,
                };
                const innerScale =
                    ((currInnerWall.x - prevInnerWall.x) * currTangent.y -
                        (currInnerWall.y - prevInnerWall.y) * currTangent.x) /
                    crossCheck;

                inner.vertices.push({
                    x: prevInnerWall.x + innerScale * prevTangent.x,
                    y: prevInnerWall.y + innerScale * prevTangent.y,
                });

                inner.joinRadii.push(outer.joinRadii[i] - Math.max(prevThickness, currThickness));
            }
        }

        return { outer, inner, common, vectors, hasThickness, hasRadii };
    };

    export const getPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        joinRadii?: number[],
        lameExponents?: number[],
        offset: number = 0,
    ) => {
        const cacheKey = JSON.stringify({ vertices, edgeThicknesses, joinRadii, lameExponents, offset });

        if (PATH_CACHE[cacheKey]) return PATH_CACHE[cacheKey];

        const generatePolylineCorner = (
            arcStart: Point2d,
            arcEnd: Point2d,
            prevTangent: Point2d,
            currTangent: Point2d,
            crossCheck: number,
            radius: number,
            exponent: number,
            resolutionRatio: number = 1,
        ): Point2d[] => {
            const resolution = Math.max(1, Math.ceil(Math.sqrt(radius))) * 4 * resolutionRatio;
            const cssExponent = exponent >= 0 ? exponent + 1 : 1 / (1 - exponent);
            const superelipsePow = 2 / cssExponent;

            if (radius <= 0 || cssExponent === Infinity) {
                const dx = arcEnd.x - arcStart.x;
                const dy = arcEnd.y - arcStart.y;
                const intersectionDist = (dx * currTangent.y - dy * currTangent.x) / crossCheck;
                const W = {
                    x: arcStart.x + intersectionDist * prevTangent.x,
                    y: arcStart.y + intersectionDist * prevTangent.y,
                };
                return [arcStart, W, arcEnd];
            }

            const dx = arcEnd.x - arcStart.x;
            const dy = arcEnd.y - arcStart.y;
            const tIntersect = (dx * currTangent.y - dy * currTangent.x) / crossCheck;
            const W = { x: arcStart.x + tIntersect * prevTangent.x, y: arcStart.y + tIntersect * prevTangent.y };

            if (cssExponent <= 0) {
                const innerCenter = { x: arcStart.x + arcEnd.x - W.x, y: arcStart.y + arcEnd.y - W.y };
                return [arcStart, innerCenter, arcEnd];
            }

            const C = { x: arcStart.x + arcEnd.x - W.x, y: arcStart.y + arcEnd.y - W.y };
            const vecX = { x: arcStart.x - C.x, y: arcStart.y - C.y };
            const vecY = { x: arcEnd.x - C.x, y: arcEnd.y - C.y };
            const pts: Point2d[] = [arcStart];

            for (let i = 1; i < resolution; i++) {
                const t = (i / resolution) * HALF_PI;
                const xFactor = Math.pow(Math.cos(t), superelipsePow);
                const yFactor = Math.pow(Math.sin(t), superelipsePow);
                pts.push({
                    x: C.x + xFactor * vecX.x + yFactor * vecY.x,
                    y: C.y + xFactor * vecX.y + yFactor * vecY.y,
                });
            }
            pts.push(arcEnd);

            return pts;
        };

        const vertexCount = vertices.length;

        if (vertexCount < 3) return { outerPath: "", innerPath: "", outerPoints: [], innerPoints: [] };

        const { outer, inner, common, vectors, hasThickness, hasRadii } = setupPaths(
            vertices,
            edgeThicknesses,
            joinRadii,
            lameExponents,
            offset,
        );

        if (!hasRadii) {
            const outerPathSegments = outer.vertices.map((v) => `L ${v.x.toFixed(3)} ${v.y.toFixed(3)}`);
            const outerPath = `M ${outer.vertices[vertexCount - 1].x.toFixed(3)} ${outer.vertices[vertexCount - 1].y.toFixed(3)} ${outerPathSegments.join(" ")} Z`;

            let innerPath = "";
            let innerPoints = inner.vertices;

            if (!hasThickness) {
                innerPath = outerPath;
                innerPoints = outer.vertices;
            } else {
                const innerPathSegments = inner.vertices.map((v) => `L ${v.x.toFixed(3)} ${v.y.toFixed(3)}`);
                innerPath = `M ${inner.vertices[vertexCount - 1].x.toFixed(3)} ${inner.vertices[vertexCount - 1].y.toFixed(3)} ${innerPathSegments.join(" ")} Z`;
            }

            return { outerPath, innerPath, outerPoints: outer.vertices, innerPoints };
        }

        const { unitTangents, unitNormals, crossChecks } = vectors;
        const outerPathSegments: string[] = [];
        const outerStartPoints: Point2d[] = [];
        const outerEndPoints: Point2d[] = [];
        const innerPathSegments: string[] = [];
        const innerStartPoints: Point2d[] = [];
        const innerEndPoints: Point2d[] = [];

        for (let i = 0; i < vertexCount; i++) {
            const prevIndex = ObjectUtils.getPrevArrayIndex(i, vertexCount);
            const vertex = vertices[i];
            const kappa = common.lameExponents[i];
            const prevTangent = unitTangents[prevIndex];
            const currTangent = unitTangents[i];
            const prevNormal = unitNormals[prevIndex];
            const currNormal = unitNormals[i];
            const crossCheck = crossChecks[i];
            const outerRadius = outer.joinRadii[i];

            const prevArcRefPt = {
                x: vertex.x + (offset - outerRadius) * prevNormal.x,
                y: vertex.y + (offset - outerRadius) * prevNormal.y,
            };
            const currArcRefPt = {
                x: vertex.x + (offset - outerRadius) * currNormal.x,
                y: vertex.y + (offset - outerRadius) * currNormal.y,
            };
            const outerIntersectionScale =
                ((currArcRefPt.x - prevArcRefPt.x) * currTangent.y -
                    (currArcRefPt.y - prevArcRefPt.y) * currTangent.x) /
                crossCheck;
            const cornerArcCenter = {
                x: prevArcRefPt.x + outerIntersectionScale * prevTangent.x,
                y: prevArcRefPt.y + outerIntersectionScale * prevTangent.y,
            };
            const outerArcStart = {
                x: cornerArcCenter.x + outerRadius * prevNormal.x,
                y: cornerArcCenter.y + outerRadius * prevNormal.y,
            };
            const outerArcEnd = {
                x: cornerArcCenter.x + outerRadius * currNormal.x,
                y: cornerArcCenter.y + outerRadius * currNormal.y,
            };

            const outerPts = generatePolylineCorner(
                outerArcStart,
                outerArcEnd,
                prevTangent,
                currTangent,
                crossCheck,
                outerRadius,
                kappa,
            );

            const outerStr = outerPts.map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(" ");
            outerPathSegments.push(outerStr);
            outerStartPoints.push(outerPts[0]);
            outerEndPoints.push(outerPts[outerPts.length - 1]);

            if (!hasThickness) {
                innerPathSegments.push(outerStr);
                innerStartPoints.push(outerPts[0]);
                innerEndPoints.push(outerPts[outerPts.length - 1]);

                continue;
            }

            const prevThickness = common.edgeThicknesses[prevIndex];
            const currThickness = common.edgeThicknesses[i];
            const maxThickness = Math.max(prevThickness, currThickness);
            const isConcave = kappa < 0;
            const innerRadius = outerRadius - maxThickness;
            const fallbackInnerRadius = inner.joinRadii[i];
            const sharpInnerIntersection = inner.vertices[i];

            if (!isConcave && (innerRadius <= 0 || fallbackInnerRadius <= 0)) {
                innerPathSegments.push(
                    `L ${sharpInnerIntersection.x.toFixed(3)} ${sharpInnerIntersection.y.toFixed(3)}`,
                );
                innerStartPoints.push(sharpInnerIntersection);
                innerEndPoints.push(sharpInnerIntersection);
            } else {
                const layoutRadius = isConcave ? outerRadius : innerRadius;
                const prevInnerArcRefPt = {
                    x: vertex.x + (offset - prevThickness - layoutRadius) * prevNormal.x,
                    y: vertex.y + (offset - prevThickness - layoutRadius) * prevNormal.y,
                };
                const currInnerArcRefPt = {
                    x: vertex.x + (offset - currThickness - layoutRadius) * currNormal.x,
                    y: vertex.y + (offset - currThickness - layoutRadius) * currNormal.y,
                };
                const innerIntersectionScale =
                    ((currInnerArcRefPt.x - prevInnerArcRefPt.x) * currTangent.y -
                        (currInnerArcRefPt.y - prevInnerArcRefPt.y) * currTangent.x) /
                    crossCheck;
                const innerCornerArcCenter = {
                    x: prevInnerArcRefPt.x + innerIntersectionScale * prevTangent.x,
                    y: prevInnerArcRefPt.y + innerIntersectionScale * prevTangent.y,
                };
                const innerArcStart = {
                    x: innerCornerArcCenter.x + layoutRadius * prevNormal.x,
                    y: innerCornerArcCenter.y + layoutRadius * prevNormal.y,
                };
                const innerArcEnd = {
                    x: innerCornerArcCenter.x + layoutRadius * currNormal.x,
                    y: innerCornerArcCenter.y + layoutRadius * currNormal.y,
                };

                const innerPts = generatePolylineCorner(
                    innerArcStart,
                    innerArcEnd,
                    prevTangent,
                    currTangent,
                    crossCheck,
                    layoutRadius,
                    kappa,
                );

                innerPathSegments.push(innerPts.map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(" "));
                innerStartPoints.push(innerPts[0]);
                innerEndPoints.push(innerPts[innerPts.length - 1]);
            }
        }

        const outerPoints: Point2d[] = [];
        const innerPoints: Point2d[] = [];

        let outerPath = `M ${outerEndPoints[vertexCount - 1].x.toFixed(3)} ${outerEndPoints[vertexCount - 1].y.toFixed(3)}`;
        let innerPath = `M ${innerEndPoints[vertexCount - 1].x.toFixed(3)} ${innerEndPoints[vertexCount - 1].y.toFixed(3)}`;

        for (let i = 0; i < vertexCount; i++) {
            outerPath += " " + outerPathSegments[i];
            innerPath += " " + innerPathSegments[i];

            outerPoints.push(outerStartPoints[i]);
            if (outerStartPoints[i].x !== outerEndPoints[i].x || outerStartPoints[i].y !== outerEndPoints[i].y) {
                outerPoints.push(outerEndPoints[i]);
            }

            innerPoints.push(innerStartPoints[i]);
            if (innerStartPoints[i].x !== innerEndPoints[i].x || innerStartPoints[i].y !== innerEndPoints[i].y) {
                innerPoints.push(innerEndPoints[i]);
            }
        }

        const result = {
            outerPath: `${outerPath} Z`,
            innerPath: `${innerPath} Z`,
            outerPoints,
            innerPoints,
        };

        PATH_CACHE[cacheKey] = result;

        return result;
    };

    export const getRectPadding = (
        edgeThicknesses: number[],
        joinRadii?: number[],
        lameExponents?: number[],
    ): CSS.PropertiesHyphen => {
        const count = 4;

        const et = ObjectUtils.padArray(edgeThicknesses, 0, count);
        const jr = ObjectUtils.padArray(joinRadii ?? [], 0, count);
        const le = ObjectUtils.padArray(lameExponents ?? [], CIRCLE_KAPPA, count);

        const getCornerPadding = (index: number) => {
            const t = et[index];
            const e = le[index];
            const r = jr[index];
            const cssExponent = e >= 0 ? e + 1 : 1 / (1 - e);
            const fOut = Math.pow(0.5, 1 / cssExponent);
            const cornerIntrusion = r * (1 - fOut) + t * Math.SQRT1_2;

            return Math.max(t, Math.round(cornerIntrusion));
        };

        const cornerPadding = Array.from({ length: count }, (_, idx) => getCornerPadding(idx));

        return {
            "padding-top": `${cornerPadding[0]}px`,
            "padding-right": `${cornerPadding[1]}px`,
            "padding-bottom": `${cornerPadding[2]}px`,
            "padding-left": `${cornerPadding[3]}px`,
        };
    };

    export const getPolygonPadding = (size: Size2d, innerPoints: Point2d[]): CSS.PropertiesHyphen => {
        const innerRect = ShapeUtils.getInnerRect(innerPoints);

        return {
            "padding-top": `${innerRect.y}px`,
            "padding-left": `${innerRect.x}px`,
            "padding-bottom": `${size.height - innerRect.y - innerRect.height}px`,
            "padding-right": `${size.width - innerRect.x - innerRect.width}px`,
        };
    };
}
