/** A delayed function with a way to call off any run that is still pending. */
export type CancellableFunction<A extends unknown[]> = ((...args: A) => void) & {
    /** Throws away any pending run. Safe to call more than once, and safe if nothing is pending. */
    cancel: () => void;
};

export namespace FunctionUtils {
    /** Does nothing. Useful as a default for an optional callback. */
    export const noop = () => {};

    /** Does nothing and resolves immediately. Useful as a default for an optional async callback. */
    export const noopAsync = async () => {};

    /**
     * Waits until the calls stop coming, then runs once.
     *
     * Every new call cancels the previous countdown, so a burst of activity produces a
     * single run `delay` milliseconds after the **last** call. Good for "search as you
     * type" and for reacting to a resize once it settles.
     *
     * Always call `cancel()` when tearing down (a React effect cleanup, for instance),
     * or a pending run can fire after the thing it updates is gone.
     *
     * @param fn What to run. It receives the arguments from the most recent call.
     * @param delay How long the calls must stay quiet, in milliseconds.
     * @returns The wrapped function, with a `cancel` method attached.
     */
    export const debounce = <A extends unknown[]>(fn: (...args: A) => void, delay: number): CancellableFunction<A> => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const wrapped = (...args: A) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                fn(...args);
            }, delay);
        };

        wrapped.cancel = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        return wrapped;
    };

    /**
     * Runs at most once per `delay`, and never drops the final call.
     *
     * The first call runs straight away. Calls arriving during the cooling-off period
     * are collapsed into one run at the end of it, so the last value always makes it
     * through. Good for scroll and pointer-move handlers, where you want steady updates
     * *and* a correct resting state.
     *
     * Always call `cancel()` when tearing down (a React effect cleanup, for instance),
     * or a pending run can fire after the thing it updates is gone.
     *
     * @param fn What to run. It receives the arguments from the most recent call.
     * @param delay Shortest gap between runs, in milliseconds.
     * @returns The wrapped function, with a `cancel` method attached.
     */
    export const trailingThrottle = <A extends unknown[]>(
        fn: (...args: A) => void,
        delay: number,
    ): CancellableFunction<A> => {
        let lastCall = 0;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        // The timer is only ever scheduled once per cooling-off period, so the arguments
        // live out here rather than in the timer's closure. Later calls in the same
        // period overwrite them, which is what lets the last value through.
        let pendingArgs: A | null = null;

        const wrapped = (...args: A) => {
            const now = Date.now();
            const remaining = delay - (now - lastCall);

            if (remaining <= 0) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                pendingArgs = null;
                lastCall = now;
                fn(...args);

                return;
            }

            pendingArgs = args;

            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    const argsToRunWith = pendingArgs as A;

                    lastCall = Date.now();
                    timeoutId = null;
                    pendingArgs = null;
                    fn(...argsToRunWith);
                }, remaining);
            }
        };

        wrapped.cancel = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            pendingArgs = null;
        };

        return wrapped;
    };
}
