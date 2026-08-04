export namespace BitwiseUtils {
    /**
     * Checks whether a single flag is switched on inside a bitmask.
     *
     * @param currentFlags The bitmask to inspect.
     * @param flagToCheck The single flag to look for. Must be a power of two.
     * @returns `true` if the flag is set.
     */
    export const hasFlag = <T extends number>(currentFlags: number, flagToCheck: T): boolean => {
        return Boolean(currentFlags & flagToCheck);
    };

    /**
     * Checks whether *every* one of the given flags is switched on inside a bitmask.
     *
     * @param currentFlags The bitmask to inspect.
     * @param flagsToCheck The flags that must all be present. An empty list returns `true`.
     * @returns `true` only if no flag is missing.
     */
    export const hasFlags = <T extends number>(currentFlags: number, flagsToCheck: T[]): boolean => {
        for (const flag of flagsToCheck) {
            if (!hasFlag(currentFlags, flag)) {
                return false;
            }
        }

        return true;
    };

    /**
     * Switches the given flags on, leaving every other bit untouched.
     *
     * Flags that are already set are left alone, so calling this twice with the same
     * flag is safe.
     *
     * @param currentFlags The starting bitmask.
     * @param add The flags to switch on.
     * @returns A new bitmask. The input is not modified.
     */
    export const addFlags = <T extends number>(currentFlags: number, add: T[]): number => {
        return add.reduce<number>((result, flag) => result | flag, currentFlags);
    };

    /**
     * Switches the given flags off, leaving every other bit untouched.
     *
     * Flags that are already absent are left alone, so calling this twice with the same
     * flag is safe.
     *
     * @param currentFlags The starting bitmask.
     * @param remove The flags to switch off.
     * @returns A new bitmask. The input is not modified.
     */
    export const removeFlags = <T extends number>(currentFlags: number, remove: T[]): number => {
        return remove.reduce<number>((result, flag) => result & ~flag, currentFlags);
    };
}
