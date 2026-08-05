import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Everything covered here is pure arithmetic and string building, so the plain
        // Node environment is enough. The modules that read from a live page —
        // Keyframes, DOM, io and the JSX text metrics/parser DOM walkers — are left out
        // deliberately; they need a browser-like environment wired up first.
        environment: "node",
        include: ["test/**/*.test.ts"],
    },
});
