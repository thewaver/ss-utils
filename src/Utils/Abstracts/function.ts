export namespace FunctioUtils {
    export const noop = () => {};

    export const noopAsync = async () => {};

    export const debounce = (fn: () => void, delay: number) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                fn();
            }, delay);
        };
    };

    export const trailingThrottle = (fn: () => void, delay: number) => {
        let lastCall = 0;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        return () => {
            const now = Date.now();
            const remaining = delay - (now - lastCall);

            if (remaining <= 0) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                lastCall = now;
                fn();
            } else if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    lastCall = Date.now();
                    timeoutId = null;
                    fn();
                }, remaining);
            }
        };
    };
}
