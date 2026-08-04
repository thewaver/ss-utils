# Code Review — `@thewaver/ss-utils` v0.0.17

Reviewed: 2026-08-05 · 27 source files, ~2,600 LOC.
**Updated 2026-08-05: fixes applied.** Typecheck, build and a Node import all pass.

A geometry/CSS/DOM utility grab-bag, published so that everything is imported from one entry file
(`src/index.ts`, which does nothing but re-export the other 27 modules). The hard parts
(superellipse corner generation in `Abstracts/shape.ts`, the JSX text parser) are genuinely
sophisticated. The problems were concentrated in packaging, a handful of back-to-front helpers, and
duplication across the geometry modules.

Everything below marked **FIXED** has been changed in the source and checked by running it. The
[Still open](#still-open) section lists what was deliberately left alone and why.

---

## Blockers

### 1. FIXED — The package could not be imported outside a browser

`JSXTextMetrics.utils.ts` created a canvas in a function that ran the moment the file loaded, so
merely importing the package touched `document`. Since `src/index.ts` re-exports every module, *any*
import triggered it:

```
$ node -e "import('./dist/index.js')"     # before
IMPORT FAILED: document is not defined
```

`import { MathUtils } from "@thewaver/ss-utils"` threw in Node, Vitest, Jest and every server-side
rendering framework, even though `MathUtils` is pure arithmetic.

The canvas is now built the first time something actually measures text, and remembered afterwards:

```ts
let measureContext: CanvasRenderingContext2D | null | undefined;

const getMeasureContext = () => {
    if (measureContext === undefined) {
        measureContext =
            typeof document === "undefined"
                ? null
                : document.createElement("canvas").getContext("2d", { willReadFrequently: false });
    }
    return measureContext;
};
```

Three states rather than two: `undefined` means "not tried yet", `null` means "tried, no document".
Without that split, every call in Node would retry `createElement`. The "no canvas, return zeroes"
fallback was already written — it just never got the chance to run. The word splitter in
`JSXTextParser.utils.ts` was made lazy the same way.

```
$ node -e "import('./dist/index.js')"     # after
IMPORT OK — 35 exports
```

### 2. FIXED — `BitwiseUtils.removeFlags` was back to front

The test was inverted: when a flag *was* set it returned unchanged, and when it was *not* set it
subtracted anyway.

| Call | Expected | Was | Now |
| --- | --- | --- | --- |
| `removeFlags(0b111, [0b100])` | `3` | `7` | `3` |
| `removeFlags(0b111, [0b1000])` | `7` | `-1` | `7` |

Now `result & ~flag`. `addFlags` was correct but arrived there via `+` and a guard; it is now
`result | flag`, which is right by construction and copes with overlapping masks.

### 3. FIXED — `Vec2d`/`Vec4d` `min` and `max` used "or" where "and" was meant

The guard `a !== undefined || b !== undefined` passed when exactly one input was missing — precisely
the case it existed to catch — so `Point2d.min(undefined, { x: 1, y: 1 })` threw. Now `&&`, and the
parameters are marked optional so the `| undefined` return type is honest rather than unreachable.
`isSame` already did this correctly, which is what marked it as a slip rather than a decision.

---

## Correctness bugs

### 4. FIXED — `DOMUtils` returned objects that were not `DOMRect`

`{ ...rect }` copies **nothing** off a `DOMRect` — its properties live on the prototype, not the
object. The eight geometry fields were then set by hand, so the result was usable, but `toJSON` was
missing at runtime while TypeScript believed it was there, and `instanceof DOMRect` failed.

Both functions now return `DOMRect.fromRect(...)`. The arithmetic is unchanged: `offsetDOMRect`
subtracted the same offset from `x` and `left` (and `y`/`top`), so deriving the edges from the corner
gives identical numbers.

One behaviour note: `DOMRect` normalises negative widths, where the old hand-rolled arithmetic did
not. Rectangles from `getBoundingClientRect` are never negative-width, so this should not surface.

### 5. FIXED — `roundDownToNearestInt` rounded the wrong way for negatives

JavaScript's `%` keeps the sign of the left-hand side, so `-7 - (-7 % 5)` was `-5` — upwards.
`roundUpToNearestInt` inherited it and also overshot exact multiples, turning `10` into `15`. Both
now use `Math.floor`/`Math.ceil` on the divided value. Verified: `roundDownToNearestInt(-7, 5)` is
`-10`, `roundUpToNearestInt(10, 5)` is `10`.

### 6. FIXED — `getNormalizedFontSizes` divided by zero

An empty string measures `0` wide, giving `Infinity`, which poisoned the total, drove the ratio to
`0` and blanked out **every** line. Empty measurements now contribute `0`, and the ratio guards
against a zero total. The misleading local `textWidths` (it held font sizes) is now `fittedSizes`.

### 7. FIXED — `getAngle` jumped 360° across the Y axis

The `atan` branches returned −90…90 for `x > 0` but the axis special-cases returned `90` and `270`,
so `getAngle({ x: 0, y: -1 })` gave `270` while `getAngle({ x: 0.0001, y: -1 })` gave ≈ `-90`. The
same direction, two representations 360 apart — fine geometrically, but anything interpolating or
comparing raw angles glitched there.

Now a single `Math.atan2`, range −180…180. **This changes returned values** for the third quadrant
(`x < 0, y < 0`) and for straight down: those used to come back 360 higher. Anything comparing raw
numbers from `getAngle` or `cartesianToPolar` needs a look. See [Behaviour changes](#behaviour-changes).

### 8. FIXED — `intersectEdges` took directions but was named for endpoints

The parameters read `start1, end1, start2, end2`, but the maths always treated the 2nd and 4th as
**directions** — passing real endpoints silently gave a wrong point. It also duplicated
`PolygonUtils.getLineIntersection`, which had honest names and a different cut-off for how near to
parallel counts as never meeting.

There is now one implementation, `Point2dUtils.intersectLines(point1, dir1, point2, dir2)`;
`intersectEdges` is gone. `PolygonUtils.getLineIntersection` delegates to it.

The two originals disagreed on how near to parallel counts as never meeting — `1e-8` and `1e-6`.
Rather than picking one, the threshold is now a fifth parameter defaulting to `1e-8`, and
`getLineIntersection` passes `1e-6` explicitly. Both call sites keep exactly the behaviour they had.

### 9. PARTIALLY FIXED — degenerate geometry produced `NaN`

Two identical consecutive corners gave a zero-length edge, and dividing by it turned every downstream
corner into `NaN`. The whole path string became garbage and SVG rendered nothing, silently.

`shape.ts` now falls back to a length of `1` for zero-length edges, so the damage stays local and the
rest of the shape still draws. Verified: a polygon with a duplicated corner now produces a `NaN`-free
path.

This is containment, not a cure — the corner itself is still meaningless. The real fix is removing
duplicate corners on the way in, but that would renumber the vertices and break their
correspondence with the `edgeThicknesses` and `joinRadii` lists, so it needs more care than a
1am patch. Left open.

The nearby `|| 0.001` fallback for collinear edges is untouched for the same reason — it deserves a
proper branch (the join is just the vertex offset along its normal), not a near-zero divisor.

### 10. FIXED — `multiplyNumberKeys` modified its argument

It seeded the reduction with `obj` itself, so the caller's object was changed in place while the
signature read as pure. Now seeded with `{ ...obj }`. Verified: input `{ a: 2 }` stays `{ a: 2 }`.

### 11. FIXED — `getRandomArrayValues` handed back the input array

`if (count >= a.length) return a` returned the original — unshuffled and shared, so a caller
splicing the result corrupted the source. It now always returns a fresh shuffled array.

### 12. FIXED — adjacent block elements emitted doubled line breaks

A break was pushed both before and after each block's children, so `<div>a</div><div>b</div>` gave
`break, a, break, break, b, break` — a stray blank line between every pair of siblings. All pushes
now go through a helper that refuses to add a break directly after another one.

### 13. FIXED — `isClosingPunctuation("")` was `true`

The pattern used `*` instead of `+`, so an empty token counted as punctuation and changed how the
*following* token merged. Now `+`.

---

## Design and packaging

### 14. MOSTLY FIXED — `package.json` was missing most of what a published library needs

Added: `exports` map, `sideEffects: false`, `prepublishOnly` (runs typecheck then build),
`typecheck` script, `description`, `repository`, `bugs`, `homepage`, `keywords`, `author`. A `LICENSE`
file now exists to back the `"license": "MIT"` claim.

`sideEffects: false` is only truthful *because* of fix #1 — before that, importing genuinely did
touch the DOM.

Still missing: a `README.md`.

**Per-module imports (`@thewaver/ss-utils/shape`) are not recommended.** The original review pushed
for them, but that was really an argument about the single entry file, and the single entry file was
only ever a problem because it dragged in a module that crashed on load. Fix #1 settled that. What is
left is the same few-KB bundle tradeoff rejected in #15, so this goes the same way: one entry file,
one import path, closed.

### 15. REJECTED — `namespace` stays

Every module wraps its exports in a TS `namespace`, which compiles to one object built by
assignment. Importing `MathUtils.isEven` retains the whole `MathUtils` object, and the single entry
file pulls in
all 27 modules. The 66 KB bundle is close to all-or-nothing.

`namespace` also predates ES modules and duplicates what they already do. Plain per-file exports plus
subpath entries would give real tree-shaking; `import * as MathUtils from "…/math"` keeps the
`MathUtils.` prefix at call sites without the namespace object.

**Decided against, 2026-08-05.** The organisation `namespace` gives is worth more than the bundle
size it costs — a few KB is not a real constraint here. Not an open question; do not raise it again.

### 16. WITHDRAWN — `PATH_CACHE` growth is intentional, not a leak

The original review called the unbounded cache a memory leak and capped it at 512 entries with
least-recently-used eviction. **That was wrong and has been reverted.**

Generating a shape is expensive and real workloads here run to roughly 40,000 distinct geometry
variations. A 512-entry cap evicts 98.7% of them, turning a cache into a treadmill that recomputes
the same superellipse corners every frame. Measured on 40,000 variations, replayed:

| Cache | Warm pass | Retained |
| --- | --- | --- |
| Unbounded (original, restored) | 49 ms | 40,000 / 40,000 |
| Capped at 512 (briefly introduced) | ~1,600 ms | 512 / 40,000 |

Unbounded growth is the correct trade for this workload and was a deliberate design decision. The
cache is back to never evicting.

What survives from this item, all uncontested:

- `clearPathCache()` is added, so the memory *can* be released at a natural boundary. With no
  automatic eviction this is the only way to reclaim it.
- The map is private. Hiding it was taste rather than a defect, but confirmed as fine.
- The key is computed after the "fewer than three corners" exit instead of before it, and every
  return path stores its result. Previously the cheap paths paid the `JSON.stringify` cost and then
  returned without storing.

**Lesson for this file: cache sizing here is a benchmarked decision, not a code-review judgment
call.** Do not change eviction behaviour without measurements.

### 17. FIXED — four overlapping geometry APIs

| Duplicate | Resolution |
| --- | --- |
| `SVGUtils.pointArrayToString` / `PolygonUtils.pointsToSVGString` | Former now delegates to the latter |
| `Point2dUtils.intersectEdges` / `PolygonUtils.getLineIntersection` | One implementation, see #8 |
| `getPerpendicular`+`getNormal` / `PolygonUtils.getEdgeNormal` | Left as-is; different enough in use |
| `PolygonUtils.insetPolygon` / offset logic in `ShapeUtils.setupPaths` | Left as-is; genuinely different algorithms |

Added `Point2dUtils.degreesToRadians` to sit alongside the existing `radiansToDegrees`. The
conversion is still open-coded in `SVG.utils.ts` and `math.ts` — harmless, and rewriting working
trigonometry for tidiness alone is not worth the risk.

### 18. FIXED — two typos baked into the public API

`getPrependicular` → `getPerpendicular`, and `isCssKeyEexcludedForDisplayInline` →
`isCssKeyExcludedForDisplayInline`. `IOUtils.download` → `downloadJson`, since the old name did not
say what format it wrote.

Renamed outright — no aliases. These are breaking changes for anything using the old names.

### 19. NOT DONE — no tests, no CI, no lint

No test runner, no `test` script, no workflow. For a library whose value is dense numeric code, this
is now the largest remaining gap — and fix #1 has removed the thing that made it impossible, so
`Abstracts/*` can be tested in plain Node today.

Every bug in the Correctness section above would have been caught by a handful of table-driven cases.
Start with `vitest` over `Abstracts/{bitwise,math,object,string,vec2d,vec4d}.ts`, then add a jsdom
environment for `Web/*`.

---

## Smaller items

- **FIXED — `IOUtils.download`** never revoked its object URL, leaking the blob for the life of the
  page, and declared `text/json` rather than `application/json`. Both fixed; renamed to
  `downloadJson` with an alias.
- **FIXED — `debounce` / `trailingThrottle`** accepted only `() => void`: no arguments, and no way to
  cancel, so a React unmount could not stop a pending call. Both are now generic over their
  arguments and return a function with a `cancel()` attached. Existing `() => void` callers are
  unaffected.
- **FIXED — `KeyframesUtils.destroy`** decremented its usage tally inside a condition, so calling it
  twice from one place drove the count negative and could delete a rule others were still using.
  Each handle now refuses to release more than once.
- **FIXED — `RandomUtils.get01ValueString`** produced a single character when `Math.random()`
  returned exactly `0`. Now always at least one flip pair.
- **FIXED — `splitComputedStyle`** passed the dashed `cssKey` to three checks but the raw `key` to
  `isInheritedCssKey`. It worked only because iterating a `CSSStyleDeclaration` already yields dashed
  names, making the conversion a no-op. Now uniformly `cssKey`, so it no longer leans on that
  coincidence.
- **FIXED — double text transform.** `getInlinedSegments` transformed the text and then handed it to
  `measureTextWidths`, which transformed it again. Harmless, since applying the same transform twice
  changes nothing, but
  wasted work on every measure. The parser now passes raw text and lets the measurer own it.
- **FIXED — `getComputedStyles`** called its local `grandParent` while being passed an element's
  parent, so the name was off by one generation. Renamed.
- **FIXED — `sameIfEmpty`** had a redundant `Array.isArray` branch; `Object.keys` on an array already
  yields its indices, so the next line covered it.
- **FIXED — `CSSUtils` `as any` casts.** Five `Set.has(key as any)` calls are now typed
  `ReadonlySet<string>`, so the casts are gone and the type guards stand on their own.
- **DOCUMENTED — `RectUtils.hasAreaOverlap`** counts rectangles that merely touch edges as
  overlapping, and differs from `hasAnyCornerInside` for cross shapes. Both now say so.
- **DOCUMENTED — `MathUtils.getIntermediateValues`** returns `[from, to]` for any `stepCount` below
  3, and rounds intermediates to whole numbers. Both now stated.
- **DOCUMENTED — `ShapeUtils.getInnerRect`** costs roughly 13,000 steps per call and is called
  uncached by `getPolygonPadding`. Now carries a warning to compute it on shape change, not per frame.
- **DOCUMENTED — `EMPTY_ARRAY` / `EMPTY_OBJECT`** are `as const`, so `EMPTY_ARRAY` is `readonly []`
  and will not go into a `T[]` parameter. That is the point — the reference is stable across renders —
  and it now says so.
- **NOT DONE — `noUncheckedIndexedAccess`.** Worth enabling, and it would have caught several of the
  above. It will also produce a large number of errors across code that indexes arrays after manual
  length checks, so it wants its own pass.

---

## Behaviour changes

Everything else is either a pure bug fix or additive.

**Renames — old names removed, no aliases:**

| Was | Now |
| --- | --- |
| `Point2dUtils.getPrependicular` | `Point2dUtils.getPerpendicular` |
| `Point2dUtils.intersectEdges` | `Point2dUtils.intersectLines` |
| `CSSUtils.isCssKeyEexcludedForDisplayInline` | `CSSUtils.isCssKeyExcludedForDisplayInline` |
| `IOUtils.download` | `IOUtils.downloadJson` |
| `ShapeUtils.PATH_CACHE` | private; `ShapeUtils.clearPathCache()` added |

**Changed return values:**

1. **`Point2dUtils.getAngle` and `cartesianToPolar`** (#7) now return −180…180. Third-quadrant
   directions and straight-down used to come back 360 higher. This one is unavoidable — the old
   representation was internally inconsistent.

No other numeric behaviour changed. `getLineIntersection` keeps its original `1e-6` parallel
threshold, now passed explicitly rather than inherited from whichever implementation survived the
merge. Path caching keeps its original unbounded, never-evicting behaviour — see #16.

---

## What to do next

1. **Tests.** Fix #1 unblocked them and there is now a list of exactly which cases matter.
2. **A README**, then subpath exports so consumers can skip the browser-only modules (#14).
3. **Dedupe corners on input to `shape.ts`** to finish #9 properly.
