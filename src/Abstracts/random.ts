export namespace RandomUtils {
    export const get01ValueString = (maxLength: number) => {
        const pattern = Math.random() >= 0.5 ? "0;1;" : "1;0;";
        const result = pattern.repeat(Math.ceil(Math.random() * maxLength)) + pattern[0];

        return result;
    };
}
