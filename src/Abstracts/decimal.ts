const FALLBACK_GROUP_SEPARATOR = ",";
const FALLBACK_DECIMAL_SEPARATOR = ".";
const SAMPLE_VALUE = 1234.5;
const RADIX = 10;
const HALF_DIGIT = 5;

/** Reading and writing decimal numbers as digit strings, for amount fields and the like. */
export namespace DecimalUtils {
    /**
     * Finds the characters a locale uses to group thousands and to mark the fraction.
     *
     * These are read out of `Intl` rather than taken as arguments, for the same reason month
     * names are: a consumer who has said which locale they are in has already answered this,
     * and a library that asks again invites the two to disagree.
     *
     * @param locale Which locale to read, or the environment's own when left out.
     * @returns The group and decimal separators, falling back to `,` and `.` if the locale
     * names neither.
     */
    export const getSeparators = (locale?: string) => {
        const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).formatToParts(SAMPLE_VALUE);

        return {
            groupSeparator: parts.find((part) => part.type === "group")?.value ?? FALLBACK_GROUP_SEPARATOR,
            decimalSeparator: parts.find((part) => part.type === "decimal")?.value ?? FALLBACK_DECIMAL_SEPARATOR,
        };
    };

    /**
     * Converts a number into its value in the smallest unit, as a run of digits.
     *
     * The shift is done on the number's **decimal spelling** rather than by multiplying it.
     * Multiplying is the obvious way and it rounds the wrong way at every halfway case a money
     * field is built for: `1.005 * 100` is `100.49999999999999`, so `Math.round` gives ten
     * pounds fifty rather than fifty-one, and `toFixed` inherits the same fault. `${value}`
     * prints the shortest decimal that reads back as the same number — `"1.005"` — so moving
     * the point along that string and looking at the next digit rounds on what the consumer
     * wrote instead of on its binary approximation.
     *
     * A magnitude large or small enough to print in exponential form falls back to multiplying,
     * which is the one case this cannot spell; an amount field is not where `1e21` belongs.
     *
     * @param value The number to convert. The sign is dropped.
     * @param decimals How many digits the smallest unit sits below the point, so `2` for pennies.
     * @returns The digits, rounded half up. Reverse it with {@link fromDigits}.
     */
    export const toDigits = (value: number, decimals: number) => {
        const text = `${Math.abs(value)}`;

        if (text.includes("e")) return `${Math.round(Math.abs(value) * RADIX ** decimals)}`;

        const [whole, fraction = ""] = text.split(".");
        const padded = `${fraction}${"0".repeat(decimals + 1)}`.slice(0, decimals + 1);
        const shifted = Number(`${whole}${padded.slice(0, decimals)}`);

        return `${shifted + (Number(padded[decimals]) >= HALF_DIGIT ? 1 : 0)}`;
    };

    /**
     * Reads a run of digits back as a number, putting the decimal point back in.
     *
     * @param digits The value in its smallest unit, as produced by {@link toDigits}.
     * @param decimals How many digits the smallest unit sits below the point, so `2` for pennies.
     * @returns The number, or `undefined` for an empty run — an empty amount field has no value
     * rather than a value of zero.
     */
    export const fromDigits = (digits: string, decimals: number) =>
        digits.length === 0 ? undefined : Number(digits) / RADIX ** decimals;
}
