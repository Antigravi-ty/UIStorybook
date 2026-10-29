# Global instructions
Limit the amount of comments you put in the code to a strict minimum. You should almost never add comments, except sometimes on non-trivial code, function definitions if the arguments aren't self-explanatory, and class definitions and their members.

Do not remove existing comments unless they are directly related to what you are changing.

## Referring to code in bugs, reviews and commit messages
- **Reference a name, not a position.** This text outlives the code it describes, so cite a selector, function, class, pref or flag name; name a file without a line, and avoid positional phrasing ("the rule above X").

## Code Style
- Our style guide forbids the use of emoji.
- Every file in this repository—including source code, UI strings, comments, console output, documentation, and commit messages—must be written strictly in English.
- **Standalone Commits & Zero Legacy Baggage**: Treat every commit as a standalone version. Do not maintain backward or forward compatibility shims, deprecated fallbacks, alias maps, or dead code. Prioritize code clarity, interpretability, and native engineering quality above all else.
- **Self-Explanatory Naming & File Granularity**: All variables, functions, components, and modules must use clear, semantic, self-explanatory names. Keep every source file compact (< 600 lines, modularized by responsibility) so agents can inspect or patch modules without context overflow.

## Architecture Boundaries & Performance Invariants
- Maintain zero circular dependencies across the codebase.
- **Strict Unidirectional Layer Hierarchy**: Enforce `tokens` <- `primitives` <- `layout` <- `compounds` <- `navigation` <- (`hud` | `charts` | `viewport` | `loading`) <- (`panels` | `recipes`) <- `showcase`. Lower layers must never import from higher layers, and `showcase` modules must never be imported by any reusable layer.
- **Pure Presentational Components & Host Decoupling**: Reusable UI layers (`primitives` through `recipes`) must remain pure presentational (`React.memo`, driven via props and callbacks) with zero game engine singletons or WebAssembly dependencies. Stores in `tokens/` must use `syncBridge` and persistence hooks rather than importing transport or host config modules directly.
- **High-Frequency Telemetry & Bundle Hygiene**: Never drive 120Hz HUD or chart updates through React state re-renders; use `hudTransientChannel` direct DOM refs or event-driven `requestAnimationFrame` canvas ring buffers. Never use wildcard icon imports (`import * as LucideIcons`); resolve dynamic icons strictly via `lookupLucideIcon`.
