# UIStorybook 🎮

> Standardized, Zero-Black-Box, Low-Coupling UI Component Reference & Storybook for **RLCleanWASM** and High-Performance Web Applications.

---

## 💡 Why a Recipe Registry Instead of an Opaque NPM Package?

| Dimension | Opaque NPM Package | UIStorybook Recipe Registry |
|---|---|---|
| **AI Agent Visibility** | ❌ Hidden inside compiled `node_modules` | ✅ **100% transparent source**, modularized (< 800 lines/file) |
| **Coupling & Side Effects** | ❌ Rigid internal state & wrapper lock-in | ✅ **Strict L0–L7 unidirectional pyramid**, zero cross-layer leaks |
| **Runtime Overhead** | ❌ Heavy bundle & React re-render storms | ✅ **`React.memo` everywhere, tree-shaken icons, 120Hz transient DOM channels** |
| **Engine Integration** | ❌ Hard to bind to Three.js / WebAssembly loops | ✅ **Pure presentational props**; connect Zustand only at the host glue layer |

---

## 🏛️ 8-Layer Unidirectional Pyramid (`L0 ← L1 ← L2 ← L3 ← L4 ← L5 ← L6 ← L7`)

- **L0. Foundations (`src/tokens`)**: Pure TypeScript tokens, types, and stores (`colors`, `radius`, `spacing`, `easing`, `notificationTypes`, `quickNotificationStore`, `floatingStore`, `panelSizeStore`, `themeStore`). Zero JSX, zero upward imports.
- **L1. Primitives (`src/primitives`)**: Atomic memoized controls (`Badge`, `KeycapBadge`, `Button`, `ToggleSwitch`, `SegmentedSwitch`, `SliderControl`, `DualGrabberSlider`, `PrecisionDigitPicker`, `UnderlineTabs`, `InlineErrorNotice`, `tuner/*`).
- **L2. Layout & Shells (`src/layout`)**: Pure spatial containers (`VStack`, `HStack`, `GridStack`, `Card`, `SelectableCard`, `Panel`, `MenuContainer`).
- **L3. Compound Controls (`src/compounds`)**: Self-contained interactive widgets (`DropdownMenu`, `Dialogue`, `QuickNotificationDrawer`, `TunerControls`, `MenuItem`).
- **L4. Motion & Transitions (`src/motion` / `src/navigation`)**: Container morphing & window orchestration (`MorphContainer`, `FluidMorphTransition`, `SequencedStepTransition`, `MorphingShell`, `QuickNotificationSystem`, `FloatingWindowManager`, `LivePreviewDock`).
- **L5. Game Specials (`src/specials`)**: 4 orthogonal domains — **5A Match HUD** (`src/hud`), **5B High-Clarity Charts** (`src/charts`), **5C Viewport & Safe Area** (`src/viewport`), **5D Loading Pipeline** (`src/loading`).
- **L6. Patterns & Recipes (`src/recipes`)**: Pure presentational Layer 1–4 menu recipes (`Layer1MainMenuRecipe`, `Layer2GarageRecipe`, `Layer2SettingsRecipe`, `Layer3*`, `Layer4*`) and Static Training Pack inspectors.
- **L7. Sandboxes & Demos (`src/showcase/pages/*`)**: Lazy-loaded full-pipeline interactive sandboxes (`MenuLayerPreviewPage`, `MatchHudPreviewPage`, `HudElementsPage`, `QuickNotificationPage`, `NotificationIntegrationPage`).

---

## ⚡ Performance & Low-Coupling Highlights

- **Zero Wildcard Icon Bloat**: Dynamic icon names resolve through a curated tree-shakeable map (`src/primitives/iconLookup.tsx`), saving ~1.5 MB of unused SVG icons.
- **120Hz Transient HUD Channel (`src/hud/hudTransientChannel.ts`)**: High-frequency telemetry updates mutate DOM nodes or canvas buffers directly with dirty-checking, causing zero React re-renders.
- **Idle-Zero Canvas Charts (`src/charts/`)**: `<TelemetrySparklineChart>` and `<PacingOscilloscopeChart>` redraw only when ring-buffer samples arrive via coalesced `requestAnimationFrame` callbacks and cached `ResizeObserver` geometry.
- **Code-Split Showcase Pages (`src/App.tsx`)**: All non-default showcase routes load on demand via `React.lazy` + `<Suspense>`.

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Type-check & build production bundle
npm run build
```

For full architectural rules, viewport math, transition specs, and component lookup tables, see **[AGENT_GUIDE.md](./AGENT_GUIDE.md)**.
