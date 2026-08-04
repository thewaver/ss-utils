import { defineConfig } from "tsup";

export default defineConfig({
    // Every module is its own entry, and `bundle: false` transpiles them one-to-one
    // instead of flattening everything into a single file. `dist/` then mirrors `src/`,
    // and `dist/index.js` is nothing but re-export lines.
    //
    // This is what lets a consumer's bundler drop the modules it does not use: combined
    // with `"sideEffects": false` in package.json, any output file that nothing imports
    // is removed wholesale. A single bundled file cannot be pruned that way, because
    // the namespace pattern compiles to property assignments that look like side
    // effects to a bundler.
    //
    // The published import path is unchanged — consumers still import from the package
    // root.
    entry: ["src/**/*.ts"],
    bundle: false,
    format: ["esm"],
    dts: true,
    clean: true,
});
