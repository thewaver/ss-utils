export const EMPTY_ARRAY = [] as const;
export const EMPTY_OBJECT = {} as const;

export namespace ObjectUtils {
    export const sameIfEmpty = <T extends object>(obj1: T, obj2: T): boolean => {
        if (!obj1 || !obj2) return obj1 === obj2;
        if (Array.isArray(obj1) && Array.isArray(obj2) && obj1.length + obj2.length === 0) return true;
        if (Object.keys(obj1).length + Object.keys(obj2).length === 0) return true;
        return obj1 === obj2;
    };

    export const onlyDefinedProps = <T extends object, K extends keyof T>(obj: T): Partial<T> => {
        return (Object.keys(obj) as K[]).reduce((res, cur) => {
            if (obj[cur] !== undefined) {
                res[cur] = obj[cur];
            }

            return res;
        }, {} as Partial<T>);
    };

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

    export const getPrevArrayIndex = (currentIndex: number, length: number) =>
        currentIndex > 0 ? currentIndex - 1 : length - 1;

    export const getNextArrayIndex = (currentIndex: number, length: number) =>
        currentIndex < length - 1 ? currentIndex + 1 : 0;

    export const padArray = <T>(arr: T[] | undefined, defaultVal: T, count: number): T[] => {
        if (!arr || !arr.length) return Array(count).fill(defaultVal);
        return Array.from({ length: count }, (_, i) => (i < arr.length ? arr[i] : arr[arr.length - 1]));
    };

    type ZipValue<T> = T extends readonly (infer U)[] ? U : T;

    type ZipTuple<T extends readonly unknown[]> = {
        [K in keyof T]: ZipValue<T[K]>;
    };

    export const zipArray = <T extends readonly unknown[]>(...values: T) => {
        const lengths = values.filter(Array.isArray).map((v) => v.length);
        const length = lengths.length ? Math.min(...lengths) : 1;
        const zipped = Array.from({ length }, (_, i) => values.map((v) => (Array.isArray(v) ? v[i] : v)));

        return zipped as ZipTuple<T>[];
    };
}
