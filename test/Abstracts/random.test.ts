import { afterEach, describe, expect, it, vi } from "vitest";

import { RandomUtils } from "../../src/Abstracts/random.js";

describe("RandomUtils.get01ValueString", () => {
    afterEach(() => vi.restoreAllMocks());

    it("starts at 0 or 1 depending on the draw", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.6);
        expect(RandomUtils.get01ValueString(3)).toBe("0;1;0;1;0");

        vi.spyOn(Math, "random").mockReturnValue(0.2);
        expect(RandomUtils.get01ValueString(3)).toBe("1;0;1");
    });

    it("always produces at least one flip pair", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        expect(RandomUtils.get01ValueString(0)).toBe("1;0;1");
    });

    it("ends on the value it started with, keeping the loop seamless", () => {
        for (let i = 0; i < 50; i++) {
            const values = RandomUtils.get01ValueString(5).split(";");

            expect(values.at(-1)).toBe(values[0]);
        }
    });

    it("only ever contains 0 and 1, alternating", () => {
        for (let i = 0; i < 50; i++) {
            const result = RandomUtils.get01ValueString(5);

            expect(result).toMatch(/^(0;1;|1;0;)+[01]$/);
        }
    });

    it("never grows beyond the requested number of flip pairs", () => {
        for (let i = 0; i < 50; i++) {
            const pairs = (RandomUtils.get01ValueString(4).match(/;/g) ?? []).length / 2;

            expect(pairs).toBeGreaterThanOrEqual(1);
            expect(pairs).toBeLessThanOrEqual(4);
        }
    });
});
