# Agent Guide — UIStorybook Architecture & RLCleanWASM Integration

This concise reference defines the architecture, dependency rules, performance invariants, and component index for AI Agents working with **UIStorybook** and **RLCleanWASM**.

---

## 1. Core Architectural Rules ("指哪儿打哪儿" Zero-Side-Effect Design)

1. **Strict Unidirectional 8-Layer Pyramid (`L0 ← L1 ← L2 ← L3 ← L4 ← L5 ← L6 ← L7`)**:
   - Lower layers **never** import from higher layers. Same-layer primitives do not cross-couple.
   - Modifying any single file only affects its direct consumers; no hidden global side effects.
2. **Presentational vs. Host Glue Separation**:
   - All UIStorybook components are pure presentational (`React.memo`), driven strictly via `props` and explicit callbacks (`onClick`, `onChange`, `onSelect`, `onBack`).
   - **Never** inject game engine singletons or WebAssembly instances inside `L1–L6` components. In `RLCleanWASM`, connect Zustand state at the outer container layer.
3. **Agent-Friendly File Granularity**:
   - Every source file is kept compact (< 800 lines, modularized by responsibility) so AI agents can inspect or patch individual modules without context overflow.
4. **Performance & Bundle Invariants**:
   - **No wildcard `import * as LucideIcons from 'lucide-react'`**: Dynamic string icon resolution uses the curated, tree-shakeable `lookupLucideIcon` in `src/primitives/iconLookup.tsx`.
   - **120Hz Transient Telemetry (`src/hud/hudTransientChannel.ts`)**: High-frequency HUD updates (speed, boost, ball-cam, replay timeline) bypass React state via direct DOM mutation / pub-sub topics (`createTopic`) with dirty-checking.
   - **Event-Driven Canvas Charts (`src/charts/`)**: `<TelemetrySparklineChart>` and `<PacingOscilloscopeChart>` subscribe to ring-buffer notifications and coalesce draws into a single `requestAnimationFrame` (0% CPU when idle/frozen, cached `ResizeObserver` dimensions, zero per-frame array allocations).

---

## 2. 8-Layer Pyramid & Module Index

| Layer | Barrel / Path | Responsibility & Strict Boundary | Key Modules |
|---|---|---|---|
| **L0. Foundation** | `src/tokens` | Pure TS tokens, types & stores. **Zero JSX, zero L1–L7 imports.** | `colors`, `radius`, `spacing`, `easing`, `notificationTypes`, `notificationScheduler`, `quickNotificationStore`, `floatingStore`, `menuLayoutStore`, `themeStore`, `crossClientSync` (`useSyncedState`, `createScopedSyncedState`) |
| **L1. Primitives** | `src/primitives` | Atomic `React.memo` controls. Zero business logic. | `Badge`, `KeycapBadge`, `Button` (`composable`), `ToggleSwitch`, `SegmentedSwitch`, `SliderControl` (`centered`), `DualGrabberSlider`, `PrecisionDigitPicker`, `UnderlineTabs`, `InlineErrorNotice`, `iconLookup`, `tuner/*` (`ColorSwatchInput`, `UVTransformControl`, `PriorityQueueList`, `EventFilterMatrix`) |
| **L2. Layout** | `src/layout` | Structural shells & spacing containers. Zero L3+ imports. | `HStack`, `VStack`, `GridStack`, `Card`, `SelectableCard`, `Panel` (`PanelContainer`/`Header`/`Content`/`Footer`), `MenuContainer`, `HudAnchorStage` (`HudZone`, `HudSlot`, `HudRelativeAnchor`) |
| **L3. Compounds** | `src/compounds` | Self-contained multi-primitive controls. | `DropdownMenu`, `Dialogue` (`dialogue/dialogueStyles`), `QuickNotificationDrawer`, `TunerControls`, `MenuItem` |
| **L4. Motion** | `src/motion` (`src/navigation`) | Container morphing & modal focus shells. | `MorphContainer`, `FluidMorphTransition`, `SequencedStepTransition`, `MorphingShell`, `MenuStack`, `QuickNotificationSystem`, `FloatingWindowManager`, `LivePreviewDock` |
| **L5. Specials** | `src/specials` | 5 orthogonal game domains (`hud`, `charts`, `viewport`, `loading`, `center-upper`). | **5A HUD** (`src/hud/*`, `src/hud/types.ts`), **5B Charts** (`src/charts/*`), **5C Viewport** (`GameViewport`, `SafeAreaHud`), **5D Loading** (`DualProgressBar`, `LoadingScreen`), **5E Center-Upper** (`CenterUpperInfoHUD`) |
| **L6. Recipes** | `src/recipes` | Complete Layer 1–4 menu panels & static training editors. | `Layer1MainMenuRecipe`, `Layer2PlayRecipe`, `Layer2GarageRecipe` (`garage/*`), `Layer2SettingsRecipe`, `Layer2AdditionalPreviewRecipe`, `Layer2RoomHostControlRecipe`, `Layer3*Recipe`, `Layer4*Recipe`, `static-training/*` |
| **L7. Sandboxes** | `src/showcase/pages/*` | Top-level interactive sandboxes (lazy-loaded in `App.tsx`). | `MenuLayerPreviewPage` (`menu-layer/*`), `MatchHudPreviewPage` (`match-hud/*`), `HudElementsPage` (`hud-elements/*`), `CenterUpperInfoPage` (`5E`), `QuickNotificationPage` (`quick-notification/*`), `RecipesPage` (`recipes/*`), `NotificationIntegrationPage` |

---

## 3. Viewport, Safe Area & Cushioning Standards

- **Aspect Ratio Clamp (`GameViewport`)**:
  - **Max Width**: Clamped to `18:9` (`2:1`, `maxRenderW = Hsafe * 2.0`) with side pillarboxes.
  - **Min Ratio**: `1:1` (`Portrait Gate` overlay appears if width < height).
  - **Safe Area Margin**: `-5%` (overscan bleed) to `+10%` (inset protection).
  - **Scale Formula**: `scaleFactor = Number(((Wrender / 1280) * (renderScale / 100)).toFixed(3))` applied only to the content stage; Header and Sidebar stay at `100%`.
- **Panel & Menu Padding Invariants**:
  - `MenuContainer`: Always maintains `p-2` (`8px`) inner cushioning so focus rings (`focus-visible:ring-2`) and tactile scaling (`active:scale-[0.985]`) are never clipped by `overflow-hidden`.
  - `Panel` (3-Stage Compound): Header `px-6 pt-5 pb-4`, Content `px-6 py-5`, Footer `px-6 py-4` (strict `24px` horizontal alignment).

---

## 4. Container Transitions & Dual-Layer UI Paradigm

### 4.1 `MorphContainer` (`src/navigation/transitions.tsx`)
1. **`fluid-morph` (`FluidMorphTransition`)**: Continuous GPU FLIP morphing (`fluidDuration = 0.28s`, `UI_EASING.apple` `[0.2, 0.8, 0.25, 1]`). Used for fast menu transitions.
2. **`sequenced-step` (`SequencedStepTransition`)**: 3-phase state machine — **Phase 1**: content fade-out (`100ms`) $\rightarrow$ **Phase 2**: container shell resize with stable background (`150ms`) $\rightarrow$ **Phase 3**: new content fade-in (`100ms`). Prevents layout jitter on heavy forms.
3. **Intra-Layer Tabs vs. Cross-Layer Transitions**: Switching tabs inside a Layer 2 panel (`Settings` or `Garage`) never resizes the outer container; only cross-layer navigation (`Layer 1 ⇄ 2 ⇄ 3 ⇄ 4`) triggers `MorphContainer` geometry transitions.

### 4.2 Menu Layer vs. Match HUD Layer
- **Menu Layer (`<MenuLayerPreviewPage>`)**:
  - **Layer 0**: Active match view (`0px`, 100% unoccluded 3D canvas).
  - **Layer 1 (`420px`)**: `Layer1MainMenuRecipe` — instant appear/disappear (0ms animation), `shadow-[0_0_50px_rgba(0,0,0,0.85)]`, transparent backdrop (`No Blur`).
  - **Layer 2 (`560px–680px`)**: `Play`, `Garage`, `Settings`, `AdditionalPreview`, `RoomHostControl`, `Keybinding` — dimmed backdrop (`bg-black/65`, `backdrop-blur-none`).
  - **Layer 3 (`480px`) & Layer 4 (`680px–760px`)**: Deep parameter inspectors (`AudioDetail`, `BallTrajectory`, `Camera`, `StaticTrainingPack`, `AdvancedAudio`, `AdvancedController`, `EventAndTriggerer`) with Live Preview spatial docking.
- **Match HUD Layer (`<MatchHudPreviewPage>` & `src/hud/`)**:
  - Non-modal, 18:9 safe-area anchored overlays: `StepperScoreboardHUD`, `EdgePlayerHudStrip`, `CircularBoostGauge` / `DualLayerBoostPieHUD`, `VelocityProgressBar`, `BallCameraIndicator`, `FlipIndicatorPillHUD`, `ReplayControlBannerHUD`, `KickoffRhythmOverlayHUD`, `TemporalReplayFooterHUD`, `DemolishHourglassTimerHUD`, `PitchMiniMapHUD`, `StaticTrainingPackHUD`, `NetworkDiagnosticsHUD`.
  - **Zero-Coordinate-Coupling HUD Layout Shell (`src/layout/HudAnchorStage.tsx`)**:
    - `<HudAnchorStage>` + `<HudZone anchor="top-left | top-center | top-right | ...">` places HUD widgets into 9 semantic screen zones without hardcoding coordinates inside child components.
    - `<HudSlot mode="reserve" | "collapse">` controls whether hiding a widget preserves its landmark slot footprint (`reserve`, keeping DOM refs mounted for 120Hz channels) or smoothly collapses (`0fr` grid track) so sibling widgets reflow (`collapse-local` / `collapse-symmetric`).
    - `<HudRelativeAnchor placement="top | bottom | left | right" floating?>` declaratively attaches companion widgets (e.g., `FlipIndicatorPillHUD` beside `VelocityProgressBar`, or `Stacks` below/left of `EdgePlayerHudStrip`) with zero magic pixel offsets.

---

## 5. Quick Notification & Dialogue Specifications

- **`Dialogue` (`src/primitives/Dialogue.tsx`)**:
  - Zero dark backdrop mask (`bg-transparent pointer-events-none`), relying on inner glow (`inset 0 0 36px`) and outer elevation shadow (`0 0 20px`).
  - Stackable multi-instance support via `dialogue.show({ title, icon, content, tone, buttons })` or declarative `<Dialogue>`.
- **`QuickNotificationSystem` (`src/navigation/QuickNotificationSystem.tsx` & `src/tokens/quickNotificationStore.ts`)**:
  - **Decoupled `slotRight`**: Renders 0px overhead when omitted; cleanly mounts `<FloatingStackIcon />` when provided.
  - **3 Notification Types**:
    1. `temporary`: Auto-collapses into unread badge count on timeout (`3000ms` / `5000ms` / custom).
    2. `persistent`: Requires explicit user action or right-most `<CollapseToRightIcon>` collapse.
    3. `ongoing`: Lowest-priority background task bar (determinate `%` or indeterminate shimmer wave); non-dismissible by user, automatically yields to temporary/persistent notifications and restores when they clear.
  - **Button Order & HIG Contrast**: `[Business Action Buttons...] [CircleSlash Ignore (low-contrast gray)] [CollapseToRightIcon (high-contrast rightmost)]`, both `bg-transparent`. Reject actions use `thumbs-down` (never `X`).
