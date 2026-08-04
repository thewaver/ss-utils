# Instructions: make a TypeScript package tree-shakeable

Copy everything below the line into a fresh agent session in the target repository.

---

## Task

Change this package's build so that consumers only pay for the modules they actually use. Today the
build almost certainly emits one bundled file, which means a consumer importing one function drags in
the entire library. The fix is to emit **one output file per source module** while keeping the public
import path exactly as it is.

Do not change the public API, the folder structure, or how consumers import from this package. This
is a build-output change only.

## First, check this is worth doing

Report back and stop if any of these are true — they change the answer:

1. **The build already emits one file per module.** Check the output directory (usually `dist/`). If
   it mirrors the source tree rather than holding a single `index.js`, there is nothing to do.
2. **The package is an application, not a library.** This only helps things that get imported by
   other code.
3. **The build tool is not `tsup`, `rollup`, `vite build --lib`, or `tsc`.** Report what it is and
   wait for instructions rather than guessing.

## Measure before you change anything

You need a before-and-after number, otherwise you cannot tell whether this worked. Build the package
first, then:

```bash
# consumer.mjs — import ONE small thing from the package
echo 'import { X } from "<ABSOLUTE PATH TO dist/index.js>"; console.log(X);' > /tmp/consumer.mjs
npx esbuild /tmp/consumer.mjs --bundle --format=esm --minify --outfile=/tmp/out-before.js
```

Pick `X` as the smallest, most self-contained export in the package. Record the byte size.

## The change

### 1. Build config

For **tsup**, in `tsup.config.ts`:

```ts
export default defineConfig({
    entry: ["src/**/*.ts"],   // or **/*.{ts,tsx} for a component package
    bundle: false,            // transpile file-by-file instead of flattening
    format: ["esm"],
    dts: true,
    clean: true,
});
```

For **rollup** or **vite build --lib**, the equivalent is `preserveModules: true` in the output
options.

For plain **tsc**, this is already the behaviour — no change needed.

### 2. Check the build script does not override the config

A script like `"build": "tsup src/index.ts --format esm --dts --clean"` passes an entry on the
command line, which **wins over the config file** and silently undoes step 1. Reduce it to just
`"build": "tsup"` and keep all settings in the config.

### 3. `sideEffects` in package.json

This flag is what actually authorises a bundler to drop unused files. Without it the split achieves
very little.

```json
"sideEffects": false
```

**Read this carefully before setting it.** `false` promises that importing any file in this package
does nothing on its own. That is a lie if any of the following apply, and the lie will cause
bundlers to silently delete things:

- **The package imports CSS** (`import "./styles.css"`). Use
  `"sideEffects": ["**/*.css", "**/*.scss"]` instead, or the styles will vanish from consumer builds.
- **Any module runs code at load time** — registering something, patching a global, creating a DOM
  element outside a function, calling `customElements.define`.

Search for load-time work before setting the flag:

```bash
grep -rn "^[a-zA-Z].*document\.\|^[a-zA-Z].*window\.\|customElements\.define" src --include=*.ts --include=*.tsx
```

If you find any, either make it lazy (move it inside the function that needs it, remembering the
result) or list the offending files in the `sideEffects` array instead of using `false`.

### 4. Fix the import extensions — this is the trap

Splitting into separate files means the emitted code now contains real imports between them, like
`export * from "./utils/math"`. **Node's ESM loader rejects extensionless relative imports.** Bundlers
accept them, so this breaks only under Node, server-side rendering, and test runners — the places
least likely to be exercised before publishing.

Every relative import in the source needs a `.js` extension, including those in `.ts` and `.tsx`
files. The extension refers to the *emitted* file; TypeScript resolves it back to the source.

```bash
# Review the diff afterwards, and make sure the working tree is clean before running this.
node -e '
const fs=require("fs"),path=require("path");
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):(/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]));
let n=0;
for(const f of walk("src")){
  const before=fs.readFileSync(f,"utf8");
  const after=before.replace(/(from\s+")(\.\.?\/[^"]*?)(")/g,(m,a,spec,c)=>
    /\.(js|jsx|json|css|scss|svg|png)$/.test(spec)?m:(n++,a+spec+".js"+c));
  if(after!==before)fs.writeFileSync(f,after);
}
console.log("rewrote",n,"imports");'
```

This only handles `from "..."` clauses. Check separately for bare `import "./x"` side-effect imports
and dynamic `import("./x")`, and fix those by hand.

If `tsc` complains about the extensions, set `"moduleResolution": "bundler"` or `"nodenext"` in
`tsconfig.json`.

### 5. Component packages only — preserve directives

If this package ships React components used by Next.js or similar, check whether any file starts with
`"use client"`. Splitting per file preserves these correctly, but confirm they survived into the
output:

```bash
grep -rl '"use client"' dist | head
```

## Verify — all four must pass

```bash
npx tsc --noEmit                                   # 1. types still fine
npm run build                                      # 2. builds
node -e "import('./dist/index.js').then(m=>console.log('OK',Object.keys(m).length)).catch(e=>console.log('FAILED:',e.message))"
                                                   # 3. still importable under Node
```

4. Re-run the measurement from the top against the new build and compare:

```bash
npx esbuild /tmp/consumer.mjs --bundle --format=esm --minify --outfile=/tmp/out-after.js
```

Expect a large drop — in the reference case a consumer using one small function went from 36,353
bytes to 726. **If the size barely moved, the change did not take effect.** Most likely causes, in
order: the build script is still overriding the config (step 2), `sideEffects` is missing (step 3),
or something in the package really does have load-time work.

Also confirm the output directory now mirrors the source tree, and that `dist/index.js` contains only
re-export lines.

## What to report back

- Before and after byte sizes from the measurement.
- Whether `sideEffects` was set to `false` or to a list, and why.
- How many import extensions were rewritten, and any that needed fixing by hand.
- Anything found doing work at load time, and how it was made lazy.

## Rolling back

The change is confined to the build config, the build script, `package.json`, and the import
extensions. `git revert` or `git checkout` on those restores the previous behaviour. The import
extensions are harmless to keep either way.
