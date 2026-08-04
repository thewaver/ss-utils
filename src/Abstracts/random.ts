export namespace RandomUtils {
    /**
     * Builds a random alternating `0;1;0;…` string for an SVG animation `values`
     * attribute.
     *
     * Whether it starts at `0` or `1` is random, as is the number of flips, so several
     * elements sharing one animation length blink out of step with each other. The
     * result always ends on the value it started with, keeping the loop seamless.
     *
     * @param maxLength The most flip pairs to produce. Always produces at least one.
     * @returns A string such as `"0;1;0;1;0"`. Uses `Math.random`, so this is not
     * suitable for anything security-related.
     */
    export const get01ValueString = (maxLength: number) => {
        const pattern = Math.random() >= 0.5 ? "0;1;" : "1;0;";
        const repeatCount = Math.max(1, Math.ceil(Math.random() * maxLength));

        return pattern.repeat(repeatCount) + pattern[0];
    };
}
