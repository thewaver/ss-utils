export namespace ObjectUtils {
    export const getRandomArrayValues = <T>(a: Array<T>, count: number = 1): T[] => {
        if (count >= a.length) return a;

        const result = [] as T[];
        const newA = [...a];

        for (let i = 0; i < Math.max(count, 1); i++) {
            const idx = Math.floor(Math.random() * newA.length);

            result.push(newA[idx]);
            newA.splice(idx, 1);
        }

        return result;
    };

    export const getRandomRecordValues = <K extends string | number | symbol, V>(
        o: Record<K, V>,
        count: number = 1,
    ): V[] => {
        const entries = Object.values(o) as V[];

        return getRandomArrayValues(entries, count);
    };

    export const mapifyArray = <T extends object, TK extends keyof T, RK extends T[TK] extends string ? T[TK] : never>(
        arr: Array<T>,
        key: TK,
    ): Record<RK, T> => {
        return arr.reduce(
            (prev, cur) => {
                prev[cur[key] as RK] = cur;
                return prev;
            },
            {} as Record<RK, T>,
        );
    };

    export const excludeNull = <T>(arr: T[]): Exclude<T, null | undefined>[] => {
        return arr.filter((e) => e !== null && e !== undefined) as Exclude<T, null | undefined>[];
    };

    export const multiplyNumberKeys = <T extends object, K extends keyof T>(obj: T, multiplier: number): T => {
        return (Object.keys(obj) as K[]).reduce((res, curr) => {
            res[curr] = (typeof res[curr] === "number" ? ((res[curr] as number) ?? 0) * multiplier : res[curr]) as T[K];
            return res;
        }, obj);
    };

    export const filterInPlace = <T>(arr: T[], condition: (element: T, index: number, arr: T[]) => boolean): T[] => {
        let j = 0;

        arr.forEach((e, i) => {
            if (condition(e, i, arr)) {
                if (i !== j) arr[j] = e;
                j++;
            }
        });

        arr.length = j;

        return arr;
    };

    export const getPrevArrayElement = <T>(currentKey: T | undefined, allKeys: T[]): T | undefined => {
        if (!currentKey) return allKeys.at(-1);

        const currentIdx = allKeys.indexOf(currentKey);

        return allKeys[currentIdx - 1];
    };

    export const getNextArrayElement = <T>(currentKey: T | undefined, allKeys: T[]): T | undefined => {
        if (!currentKey) return allKeys.at(0);

        const currentIdx = allKeys.indexOf(currentKey);

        return allKeys[currentIdx + 1];
    };
}
