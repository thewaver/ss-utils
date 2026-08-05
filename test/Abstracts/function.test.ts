import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FunctionUtils } from "../../src/Abstracts/function.js";

describe("FunctionUtils.noop", () => {
    it("does nothing and returns undefined", () => {
        expect(FunctionUtils.noop()).toBeUndefined();
    });

    it("resolves immediately in its async form", async () => {
        await expect(FunctionUtils.noopAsync()).resolves.toBeUndefined();
    });
});

describe("FunctionUtils.debounce", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("waits for the calls to stop before running", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(99);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("collapses a burst into a single run", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("passes the arguments of the most recent call", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        debounced("first");
        debounced("second");
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledExactlyOnceWith("second");
    });

    it("throws away a pending run when cancelled", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        debounced();
        debounced.cancel();
        vi.advanceTimersByTime(1000);

        expect(fn).not.toHaveBeenCalled();
    });

    it("is safe to cancel more than once, and with nothing pending", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        expect(() => {
            debounced.cancel();
            debounced();
            debounced.cancel();
            debounced.cancel();
        }).not.toThrow();

        vi.advanceTimersByTime(1000);
        expect(fn).not.toHaveBeenCalled();
    });

    it("can run again after a cancelled run", () => {
        const fn = vi.fn();
        const debounced = FunctionUtils.debounce(fn, 100);

        debounced();
        debounced.cancel();
        debounced();
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe("FunctionUtils.trailingThrottle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // The internal clock starts at 0, so pushing the fake clock past the delay keeps
        // the very first call from being treated as one that already ran.
        vi.setSystemTime(10_000);
    });
    afterEach(() => vi.useRealTimers());

    it("runs the first call straight away", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");

        expect(fn).toHaveBeenCalledExactlyOnceWith("a");
    });

    it("holds calls made during the cooling-off period until it ends", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");
        throttled("b");
        expect(fn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("never drops the final call", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        for (let i = 0; i < 10; i++) {
            throttled(i);
            vi.advanceTimersByTime(10);
        }
        vi.advanceTimersByTime(100);

        // One leading run plus one trailing run, and nothing left pending.
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("runs again immediately once the gap has elapsed", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");
        vi.advanceTimersByTime(100);
        throttled("b");

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith("b");
    });

    it("carries the arguments of the most recent call", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("leading");
        throttled("queued");
        throttled("later");
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith("later");
    });

    it("keeps carrying the latest arguments across several windows", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");
        throttled("b");
        throttled("c");
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenLastCalledWith("c");

        throttled("d");
        throttled("e");
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenLastCalledWith("e");
    });

    it("forgets queued arguments once they have run", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");
        throttled("b");
        vi.advanceTimersByTime(100);
        vi.advanceTimersByTime(1000);

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("throws away a pending run when cancelled", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        throttled("a");
        throttled("b");
        throttled.cancel();
        vi.advanceTimersByTime(1000);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("is safe to cancel more than once, and with nothing pending", () => {
        const fn = vi.fn();
        const throttled = FunctionUtils.trailingThrottle(fn, 100);

        expect(() => {
            throttled.cancel();
            throttled.cancel();
        }).not.toThrow();
    });
});
