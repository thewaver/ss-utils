import { StringUtils } from "../../../Abstracts/string.js";

/** A registered animation, plus the means to give it back when you are done with it. */
export type KeyframesHandle = {
    /** The generated animation name to put in a CSS `animation` or `animation-name` value. */
    uniqueName: string;
    /**
     * Releases this claim on the animation.
     *
     * The rule is only really deleted once everyone using it has let go. Safe to call
     * more than once — later calls do nothing.
     *
     * @param killOrphanStyle Also removes the shared `<style>` element once the last
     * rule in it is gone.
     */
    destroy: (killOrphanStyle?: boolean) => void;
};

export namespace KeyframesUtils {
    let sharedStyleTag: HTMLStyleElement | null = null;
    let sharedSheet: CSSStyleSheet | null = null;
    let nameCounter = 0;

    const registry: Record<string, { name: string; count: number }> = {};

    const getSharedSheet = (): CSSStyleSheet | null => {
        if (sharedSheet) return sharedSheet;

        sharedStyleTag = document.createElement("style");
        sharedStyleTag.setAttribute("data-dynamic-animations", "");
        document.head.appendChild(sharedStyleTag);
        sharedSheet = sharedStyleTag.sheet;

        return sharedSheet;
    };

    /**
     * Registers a `@keyframes` animation at runtime and gives back the name to use.
     *
     * All animations share one `<style>` element, created on first use. Identical
     * animations are recognised and reuse a single rule, so a hundred elements
     * animating the same way cost one rule between them, with a tally kept of how many
     * are relying on it.
     *
     * Browser only. Always call `destroy` when the animation is no longer needed, or
     * the rule stays in the document forever.
     *
     * @param baseName A readable prefix for the generated name. A counter is appended
     * to keep it unique.
     * @param steps The animation, keyed by percentage — `{ 0: {...}, 100: {...} }`.
     * Property names are written in JavaScript style and converted for you.
     * @returns The name to animate with, and a `destroy` to release it. If there is no
     * stylesheet to write to, `uniqueName` falls back to `baseName` and `destroy` does
     * nothing.
     */
    export const createKeyframes = (
        baseName: string,
        steps: Record<number, Partial<CSSStyleDeclaration>>,
    ): KeyframesHandle => {
        const sheet = getSharedSheet();

        if (!sheet) return { uniqueName: baseName, destroy: () => {} };

        const ruleBody = Object.entries(steps)
            .map(([percent, props]) => {
                const declarations = Object.entries(props)
                    .map(([key, value]) => `${StringUtils.camelToKebabCase(key)}: ${value};`)
                    .join(" ");

                return `${percent}% { ${declarations} }`;
            })
            .join(" ");

        if (!registry[ruleBody]) {
            const uniqueName = `${baseName}-${++nameCounter}`;
            sheet.insertRule(`@keyframes ${uniqueName} { ${ruleBody} }`, sheet.cssRules.length);
            registry[ruleBody] = { name: uniqueName, count: 0 };
        }

        const activeRule = registry[ruleBody];
        activeRule.count++;

        // Guards against one caller releasing twice, which would drive the tally below
        // what it should be and delete a rule other callers are still animating with.
        let released = false;

        return {
            uniqueName: activeRule.name,
            destroy: (killOrphanStyle: boolean = false) => {
                if (released) return;

                released = true;

                if (--activeRule.count >= 1) return;

                const currentRules = Array.from(sheet.cssRules);
                const indexToDelete = currentRules.findIndex(
                    (rule) => rule instanceof CSSKeyframesRule && rule.name === activeRule.name,
                );

                if (indexToDelete !== -1) {
                    sheet.deleteRule(indexToDelete);
                }

                delete registry[ruleBody];

                if (killOrphanStyle && sharedStyleTag && sheet.cssRules.length === 0) {
                    sharedStyleTag.remove();
                    sharedStyleTag = null;
                    sharedSheet = null;
                }
            },
        };
    };
}
