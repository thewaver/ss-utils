import { Size2d } from "./size";

export namespace MathUtils {
    export const isEven = (value: number) => (value & 1) === 0;

    export const isOdd = (value: number) => (value & 1) === 1;

    export const sumTimes = (f: (index: number) => number, times: number): number => {
        let sum = 0;
        for (let i = 0; i < times; i++) sum += f(i);
        return sum;
    };

    export const roundDownToNearestInt = (value: number, near: number): number => {
        return value - (value % near);
    };

    export const roundUpToNearestInt = (value: number, near: number): number => {
        return roundDownToNearestInt(value, near) + near;
    };

    export const roundToDecimalPlaces = (value: number, decimalPlaces: number = 0): number => {
        const num = Math.round(Number(value + "e" + decimalPlaces));

        return Number(num + "e" + -decimalPlaces);
    };

    export const reverseBits = (n: number, bits: number) => {
        let r = 0;

        for (let i = 0; i < bits; i++) {
            r = (r << 1) | ((n >> i) & 1);
        }

        return r;
    };

    export const getIntermediateValues = (from: number, to: number, stepCount: number) => {
        if (stepCount < 3) return [from, to];

        const stepSize = Math.abs(to - from) / (stepCount - 1);
        const values = Array.from({ length: stepCount - 1 }, (_, index) =>
            Math.round(from < to ? from + stepSize * index : from - stepSize * index),
        );

        values.push(to);

        return values;
    };

    export const unwarpAngle = (angle: number, size: Size2d): number => {
        if (size.width === 0 || size.height === 0) return angle;

        const radians = angle * (Math.PI / 180);
        const visualX = Math.cos(radians);
        const visualY = Math.sin(radians);
        const boxX = visualX / size.height;
        const boxY = visualY / size.width;
        const unwarpedRadians = Math.atan2(boxY, boxX);

        return unwarpedRadians * (180 / Math.PI);
    };
}
