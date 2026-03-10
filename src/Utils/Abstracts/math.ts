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
}
