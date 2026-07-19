import { StringUtils } from "../../../Abstracts/string";

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

    export const createKeyframes = (baseName: string, steps: Record<number, Partial<CSSStyleDeclaration>>) => {
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

        return {
            uniqueName: activeRule.name,
            destroy: (killOrphanStyle: boolean = false) => {
                const currentRules = Array.from(sheet.cssRules);
                const indexToDelete = currentRules.findIndex(
                    (rule) => rule instanceof CSSKeyframesRule && rule.name === activeRule.name,
                );

                if (indexToDelete !== -1 && --activeRule.count < 1) {
                    sheet.deleteRule(indexToDelete);
                    delete registry[ruleBody];

                    if (killOrphanStyle && sharedStyleTag && sheet.cssRules.length === 0) {
                        sharedStyleTag.remove();
                        sharedStyleTag = null;
                        sharedSheet = null;
                    }
                }
            },
        };
    };
}
