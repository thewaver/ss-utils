export const EMPTY_ARRAY = [] as const;
export const EMPTY_OBJECT = {} as const;

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
