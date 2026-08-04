/**
 * A frozen empty array, safe to use as a default value.
 *
 * Returning this instead of a fresh `[]` keeps the reference stable between calls,
 * which stops React hooks and memo comparisons from seeing a "change" every render.
 */
export const EMPTY_ARRAY = [] as const;

/**
 * A frozen empty object, safe to use as a default value.
 *
 * Returning this instead of a fresh `{}` keeps the reference stable between calls,
 * which stops React hooks and memo comparisons from seeing a "change" every render.
 */
export const EMPTY_OBJECT = {} as const;

export namespace ObjectUtils {
    /**
     * Treats any two empty objects or arrays as equal, and otherwise compares by reference.
     *
     * Useful when a value gets rebuilt on every render but an empty result should not
     * count as a change.
     *
     * @returns `true` if both are empty, or if they are literally the same object.
     */
    export const sameIfEmpty = <T extends object>(obj1: T, obj2: T): boolean => {
        if (!obj1 || !obj2) return obj1 === obj2;
        if (Object.keys(obj1).length + Object.keys(obj2).length === 0) return true;
        return obj1 === obj2;
    };

    /**
     * Copies an object, dropping any key whose value is `undefined`.
     *
     * Keys explicitly set to `null` are kept — only `undefined` is stripped. Handy
     * before spreading user-supplied options over defaults, since `undefined` would
     * otherwise overwrite a perfectly good default.
     *
     * @returns A new object. The input is not modified.
     */
    export const onlyDefinedProps = <T extends object, K extends keyof T>(obj: T): Partial<T> => {
        return (Object.keys(obj) as K[]).reduce((res, cur) => {
            if (obj[cur] !== undefined) {
                res[cur] = obj[cur];
            }

            return res;
        }, {} as Partial<T>);
    };

    /**
     * Picks a number of entries at random, without ever picking the same one twice.
     *
     * @param a The array to draw from. It is never modified.
     * @param count How many entries to draw. Asking for at least as many as exist
     * returns a shuffled copy of everything.
     * @returns A new array. Uses `Math.random`, so this is not suitable for anything
     * security-related.
     */
    export const getRandomArrayValues = <T>(a: Array<T>, count: number = 1): T[] => {
        const result = [] as T[];
        const newA = [...a];
        const drawCount = Math.min(Math.max(count, 1), newA.length);

        for (let i = 0; i < drawCount; i++) {
            const idx = Math.floor(Math.random() * newA.length);

            result.push(newA[idx]);
            newA.splice(idx, 1);
        }

        return result;
    };

    /**
     * Picks a number of an object's values at random, without ever picking the same one twice.
     *
     * @param o The object to draw from. It is never modified.
     * @param count How many values to draw.
     * @returns A new array. Uses `Math.random`, so this is not suitable for anything
     * security-related.
     */
    export const getRandomRecordValues = <K extends string | number | symbol, V>(
        o: Record<K, V>,
        count: number = 1,
    ): V[] => {
        const entries = Object.values(o) as V[];

        return getRandomArrayValues(entries, count);
    };

    /**
     * Turns an array of objects into a lookup keyed by one of their string fields.
     *
     * If two entries share the same key value, the later one wins.
     *
     * @param arr The array to index.
     * @param key Which field to use as the lookup key. Its value must be a string.
     * @returns A new lookup object. The input is not modified.
     */
    export const mapifyArray = <
        T extends object,
        TK extends keyof T,
        RK extends (T[TK] extends string ? T[TK] : never),
    >(
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

    /**
     * Drops every `null` and `undefined` entry, and narrows the type to match.
     *
     * @returns A new array. The input is not modified.
     */
    export const excludeNull = <T>(arr: T[]): Exclude<T, null | undefined>[] => {
        return arr.filter((e) => e !== null && e !== undefined) as Exclude<T, null | undefined>[];
    };

    /**
     * Scales every numeric field of an object, leaving non-numeric fields alone.
     *
     * @param obj The object to scale.
     * @param multiplier What to multiply each number by.
     * @returns A new object. The input is not modified.
     */
    export const multiplyNumberKeys = <T extends object, K extends keyof T>(obj: T, multiplier: number): T => {
        return (Object.keys(obj) as K[]).reduce(
            (res, curr) => {
                res[curr] = (typeof res[curr] === "number" ? (res[curr] as number) * multiplier : res[curr]) as T[K];
                return res;
            },
            { ...obj },
        );
    };

    /**
     * Filters an array **in place**, modifying the array you pass in.
     *
     * Unlike `Array.filter` this allocates nothing, which matters in hot loops. The
     * trade-off is that the original array is destroyed — use `Array.filter` unless
     * you specifically need that.
     *
     * @param arr The array to filter. It **is** modified.
     * @param condition Return `true` to keep an element.
     * @returns The same array instance that was passed in.
     */
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

    /**
     * Steps backwards to the entry before the given one.
     *
     * Does not wrap: stepping back from the first entry gives `undefined`. Passing no
     * current entry starts from the end of the list.
     *
     * @returns The previous entry, or `undefined` if there is none.
     */
    export const getPrevArrayElement = <T>(currentKey: T | undefined, allKeys: T[]): T | undefined => {
        if (!currentKey) return allKeys.at(-1);

        const currentIdx = allKeys.indexOf(currentKey);

        return allKeys[currentIdx - 1];
    };

    /**
     * Steps forwards to the entry after the given one.
     *
     * Does not wrap: stepping past the last entry gives `undefined`. Passing no current
     * entry starts from the beginning of the list.
     *
     * @returns The next entry, or `undefined` if there is none.
     */
    export const getNextArrayElement = <T>(currentKey: T | undefined, allKeys: T[]): T | undefined => {
        if (!currentKey) return allKeys.at(0);

        const currentIdx = allKeys.indexOf(currentKey);

        return allKeys[currentIdx + 1];
    };

    /**
     * Steps backwards one index, wrapping around to the end when it runs off the front.
     *
     * @param currentIndex Where to start.
     * @param length How long the array is.
     */
    export const getPrevArrayIndex = (currentIndex: number, length: number) =>
        currentIndex > 0 ? currentIndex - 1 : length - 1;

    /**
     * Steps forwards one index, wrapping around to the start when it runs off the end.
     *
     * @param currentIndex Where to start.
     * @param length How long the array is.
     */
    export const getNextArrayIndex = (currentIndex: number, length: number) =>
        currentIndex < length - 1 ? currentIndex + 1 : 0;

    /**
     * Forces an array to an exact length.
     *
     * Short arrays are extended by repeating their **last** entry, which is what makes
     * CSS-style shorthand work — one radius can stand in for all four corners. Long
     * arrays are cut off. An empty or missing array is filled with `defaultVal`.
     *
     * @param arr The array to resize. It is never modified.
     * @param defaultVal Used only when `arr` is empty or missing.
     * @param count The exact length wanted.
     * @returns A new array of exactly `count` entries.
     */
    export const padArray = <T>(arr: T[] | undefined, defaultVal: T, count: number): T[] => {
        if (!arr || !arr.length) return Array(count).fill(defaultVal);
        return Array.from({ length: count }, (_, i) => (i < arr.length ? arr[i] : arr[arr.length - 1]));
    };

    type ZipTuple<T extends readonly unknown[][]> = {
        [K in keyof T]: T[K][number];
    };

    /**
     * How {@link zipArray} handles arrays of differing lengths.
     *
     * - `truncate` stops at the shortest array, dropping the extra entries.
     * - `stretch` runs to the longest array, resampling shorter ones by repeating
     *   entries so they span the full range.
     */
    type ZipMethod = "truncate" | "stretch";

    /**
     * Interleaves several arrays into one array of tuples.
     *
     * `zipArray("truncate", [1, 2, 3], ["a", "b"])` gives `[[1, "a"], [2, "b"]]`.
     *
     * @param method What to do when the arrays are different lengths. See {@link ZipMethod}.
     * @param values The arrays to interleave.
     * @returns A new array of tuples. No input is modified.
     */
    export const zipArray = <T extends readonly unknown[][]>(method: ZipMethod, ...values: T) => {
        const lengths = values.map((v) => v.length);

        if (!lengths.length) return [];

        const targetLength = method === "stretch" ? Math.max(...lengths) : Math.min(...lengths);
        const zipped = Array.from({ length: targetLength }, (_, i) =>
            values.map((v) => {
                if (method === "stretch") {
                    const scaledIndex = Math.floor(i * (v.length / targetLength));

                    return v[Math.min(scaledIndex, v.length - 1)];
                }
                return v[i];
            }),
        );

        return zipped as ZipTuple<T>[];
    };
}
