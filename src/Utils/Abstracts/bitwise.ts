export namespace BitwiseUtils {
    export const hasFlag = <T extends number>(currentFlags: number, flagToCheck: T): boolean => {
        return Boolean(currentFlags & flagToCheck);
    };

    export const hasFlags = <T extends number>(currentFlags: number, flagsToCheck: T[]): boolean => {
        for (const flag of flagsToCheck) {
            if (!hasFlag(currentFlags, flag)) {
                return false;
            }
        }

        return true;
    };

    export const addFlags = <T extends number>(currentFlags: number, add: T[]): number => {
        return add.reduce((result, flag) => (hasFlag(result, flag) ? result : result + flag), currentFlags);
    };

    export const removeFlags = <T extends number>(currentFlags: number, remove: T[]): number => {
        return remove.reduce((result, flag) => (hasFlag(result, flag) ? result : result - flag), currentFlags);
    };
}
