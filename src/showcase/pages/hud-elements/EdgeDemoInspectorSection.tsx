import React, { useMemo } from 'react';
import { createScopedSyncedState } from '../../stores/crossClientSync';
import { ShieldAlert, Sliders, RotateCcw } from 'lucide-react';
import { EdgePlayerHudStrip } from '../../../hud/EdgePlayerHudStrip';
import { DEFAULT_DEMO_INDICATOR_CONFIG, resolveDemoIndicatorConfig, type EdgeDemoIndicatorConfig, type EdgePlayerSlotState, type HudRosterViewMode } from '../../../hud/hudTransientChannel';
import { BombEmojiSvg, buildSvgDropShadowFilter } from '../../../primitives/packagedSvgIcons';
import { SliderControl } from '../../../primitives/SliderControl';
import { ToggleSwitch } from '../../../primitives/ToggleSwitch';
import { Badge } from '../../../primitives/Badge';

const useState = createScopedSyncedState('hud-5a-2-demo-inspector');

export interface EdgeDemoInspectorSectionProps {
  isLight: boolean;
}

const COLOR_SWATCHES = [
  { hex: '#EF4444', label: 'Crimson Red' },
  { hex: '#F97316', label: 'Flame Orange' },
  { hex: '#FACC15', label: 'Solar Yellow' },
  { hex: '#38BDF8', label: 'Cyan Glow' },
  { hex: '#A855F7', label: 'Neon Purple' },
  { hex: '#FFFFFF', label: 'Pure White' },
] as const;

export const EdgeDemoInspectorSection: React.FC<EdgeDemoInspectorSectionProps> = React.memo(
  ({ isLight }) => {
    const [rawDemoCfg, setDemoCfg] = useState<EdgeDemoIndicatorConfig>(
      {
        ...DEFAULT_DEMO_INDICATOR_CONFIG,
      },
      'demoCfg'
    );
    const demoCfg = resolveDemoIndicatorConfig(rawDemoCfg);
    const [persistentDemo, setPersistentDemo] = useState<boolean>(true, 'persistentDemo');
    const [respawnRemSec, setRespawnRemSec] = useState<number>(1.8, 'respawnRemSec');
    const [viewMode, setViewMode] = useState<HudRosterViewMode>('player-live', 'viewMode');
    const [demoSlots, setDemoSlots] = useState<Record<1 | 2 | 3 | 4 | 5 | 6, boolean>>(
      {
        1: false,
        2: true,
        3: false,
        4: true,
        5: true,
        6: false,
      },
      'demoSlots'
    );

    const updateDemoCfg = (patch: Partial<EdgeDemoIndicatorConfig>) => {
      setDemoCfg((prev) => resolveDemoIndicatorConfig(patch, resolveDemoIndicatorConfig(prev)));
    };

    const toggleSlotDemo = (k: 1 | 2 | 3 | 4 | 5 | 6) => {
      setDemoSlots((prev) => ({ ...prev, [k]: !prev[k] }));
    };

    const leftPlayers = useMemo<EdgePlayerSlotState[]>(
      () => [
        {
          slotKey: 1,
          team: 'left',
          name: 'You (Octane_99)',
          boostAmount: 85,
          exists: true,
          isSelf: true,
          isFocusedPov: true,
          isDemolished: persistentDemo && demoSlots[1],
          demoRespawnRemainingSec: respawnRemSec,
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 100,
        },
        {
          slotKey: 2,
          team: 'left',
          name: 'Zen_Master_RL',
          boostAmount: 42,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: persistentDemo && demoSlots[2],
          demoRespawnRemainingSec: respawnRemSec,
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 110,
        },
        {
          slotKey: 3,
          team: 'left',
          name: 'Vatira_KC',
          boostAmount: 100,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: persistentDemo && demoSlots[3],
          demoRespawnRemainingSec: respawnRemSec,
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 120,
        },
      ],
      [persistentDemo, demoSlots, respawnRemSec]
    );

    const rightPlayers = useMemo<EdgePlayerSlotState[]>(
      () => [
        {
          slotKey: 4,
          team: 'right',
          name: 'Firstkiller_NA',
          boostAmount: 64,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: persistentDemo && demoSlots[4],
          demoRespawnRemainingSec: respawnRemSec,
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 130,
        },
        {
          slotKey: 5,
          team: 'right',
          name: 'BeastMode_Fennec',
          boostAmount: 18,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: persistentDemo && demoSlots[5],
          demoRespawnRemainingSec: Math.max(0.2, respawnRemSec - 0.8),
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 140,
        },
        {
          slotKey: 6,
          team: 'right',
          name: 'Daniel_SSG',
          boostAmount: 90,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: persistentDemo && demoSlots[6],
          demoRespawnRemainingSec: respawnRemSec,
          demoRespawnTotalSec: 3.0,
          demolishedAtMs: 150,
        },
      ],
      [persistentDemo, demoSlots, respawnRemSec]
    );

    const respawnStageLabel =
      respawnRemSec > 2.0
        ? '阶段 1 · 白色 (3.0s~2.0s)'
        : respawnRemSec > 1.0
        ? '阶段 2 · 黄色 (2.0s~1.0s)'
        : '阶段 3 · 红色 (1.0s~0.0s)';

    return (
      <section id="hud-5a-2-demo-inspector" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap">
          <div className="h-6 w-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs font-mono">
            5A.2+
          </div>
          <h2 className="text-base font-bold tracking-tight">
            EdgePlayerHudStrip · 爆炸状态常驻预览与 Bomb SVG 尺寸/参数独立工作台
          </h2>
          <Badge variant="danger" size="sm" isLight={isLight}>
            Persistent Demolished Preview · Decoupled SVG Config
          </Badge>
          <span className="text-xs font-mono text-neutral-500">
            单独锁定显示被炸后的槽位位置 · 实时调节 Bomb SVG 像素尺寸/粗细/外发光
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Dedicated Persistent Demolished Strip & Isolated Card Preview Stage */}
          <div
            className={`lg:col-span-5 p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
              isLight
                ? 'bg-slate-200/80 border-neutral-300 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-red-500 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>被炸后位置常驻舞台 ({viewMode})</span>
              </span>
              <span className="opacity-75">
                尺寸: <strong>{demoCfg.sizePx}px</strong> · 粗细: <strong>{demoCfg.strokeWidth.toFixed(1)}</strong>
              </span>
            </div>

            {/* Dual-side Strip Preview Stage */}
            <div className="relative h-[168px] rounded-2xl border border-black/15 dark:border-white/10 bg-black/20 overflow-hidden flex items-center justify-between py-2">
              <EdgePlayerHudStrip
                side="left"
                teamColor="#2563EB"
                barColor="#3B82F6"
                isLight={isLight}
                viewMode={viewMode}
                players={leftPlayers}
                demoIndicatorConfig={demoCfg}
                onSelectSlot={toggleSlotDemo}
              />
              <EdgePlayerHudStrip
                side="right"
                teamColor="#EA580C"
                barColor="#F97316"
                isLight={isLight}
                viewMode={viewMode}
                players={rightPlayers}
                demoIndicatorConfig={demoCfg}
                onSelectSlot={toggleSlotDemo}
              />
            </div>

            {/* Close-up Isolated Demolished Slot & Bomb SVG Specimen */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isLight
                  ? 'bg-white/90 border-neutral-200/90 text-neutral-800'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-mono font-bold">
                  独立爆炸图标特写 (1:1 & 2x 参照)
                </span>
                <span className="text-[10px] font-mono opacity-65">
                  点击上方卡片或右侧 #1~#6 切换对应槽位爆炸状态
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* 1:1 Actual Size on #3F3F46 Demolished Pill */}
                <div
                  className="px-3 h-[32px] rounded-lg flex items-center gap-2 font-mono text-xs"
                  style={{
                    backgroundColor: '#3F3F46',
                    color: '#D4D4D8',
                    boxShadow: `0 0 14px ${demoCfg.color}66, inset 0 0 0 1px ${demoCfg.color}BF`,
                  }}
                  title="1:1 实际卡片高度 (32px) 内的渲染效果"
                >
                  <span className="text-[11px] opacity-85">1:1</span>
                  {demoCfg.variant === 'bomb-svg' ? (
                    <BombEmojiSvg
                      size={demoCfg.sizePx}
                      color={demoCfg.color}
                      strokeWidth={demoCfg.strokeWidth}
                      glowColor={demoCfg.glowColor}
                      glowBlurPx={demoCfg.glowBlurPx}
                      glowIntensityPct={demoCfg.glowIntensityPct}
                    />
                  ) : (
                    <span
                      className="font-bold leading-none"
                      style={{
                        color: demoCfg.color,
                        fontSize: `${demoCfg.sizePx}px`,
                        filter: buildSvgDropShadowFilter(
                          demoCfg.glowColor,
                          demoCfg.glowBlurPx,
                          demoCfg.glowIntensityPct
                        ),
                      }}
                    >
                      ✕
                    </span>
                  )}
                </div>

                {/* 2x Zoomed Specimen */}
                <div
                  className="w-11 h-11 rounded-xl bg-[#27272A] border border-white/10 flex items-center justify-center"
                  title="放大检视"
                >
                  {demoCfg.variant === 'bomb-svg' ? (
                    <BombEmojiSvg
                      size={Math.min(34, Math.round(demoCfg.sizePx * 1.45))}
                      color={demoCfg.color}
                      strokeWidth={demoCfg.strokeWidth}
                      glowColor={demoCfg.glowColor}
                      glowBlurPx={demoCfg.glowBlurPx}
                      glowIntensityPct={demoCfg.glowIntensityPct}
                    />
                  ) : (
                    <span
                      className="font-bold leading-none"
                      style={{
                        color: demoCfg.color,
                        fontSize: `${Math.min(34, Math.round(demoCfg.sizePx * 1.45))}px`,
                        filter: buildSvgDropShadowFilter(
                          demoCfg.glowColor,
                          demoCfg.glowBlurPx,
                          demoCfg.glowIntensityPct
                        ),
                      }}
                    >
                      ✕
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dedicated Configuration Menu for Bomb SVG Size, Persistence & Styling */}
          <div
            className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between gap-4 transition-colors shadow-2xs ${
              isLight
                ? 'bg-white border-neutral-200/90 text-neutral-800'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b pb-2.5 border-neutral-100 dark:border-neutral-800/70 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: DEMOLISHED SLOT & BOMB SVG
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDemoCfg({ ...DEFAULT_DEMO_INDICATOR_CONFIG })}
                    className="px-2 py-0.5 rounded-lg border border-neutral-400/40 text-[11px] font-mono cursor-pointer hover:bg-neutral-500/10 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>重置默认</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Persistent Demolished Toggle + Slot Switches + View Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold">持久化显示爆炸状态:</span>
                  <ToggleSwitch
                    checked={persistentDemo}
                    onCheckedChange={setPersistentDemo}
                    isLight={isLight}
                  />
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-[11px] opacity-75">爆炸槽位:</span>
                  {([1, 2, 3, 4, 5, 6] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleSlotDemo(k)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                        demoSlots[k]
                          ? 'bg-red-600 text-white border-red-500 shadow-2xs'
                          : 'border-neutral-400/40 opacity-65 hover:opacity-100'
                      }`}
                    >
                      #{k}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  {(['player-live', 'goal-replay', 'spectator'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMode(m)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] border cursor-pointer transition-all ${
                        viewMode === m
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                          : 'border-neutral-400/40 opacity-75'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Variant Selector + Size Slider + Direct Number Input + Quick Size Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">爆炸图标样式 & 尺寸 (`sizePx`)</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min={8}
                        max={36}
                        step={1}
                        value={demoCfg.sizePx}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) {
                            updateDemoCfg({ sizePx: Math.max(8, Math.min(36, v)) });
                          }
                        }}
                        className={`w-14 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                            : 'bg-neutral-950 border-neutral-700 text-white'
                        }`}
                      />
                      <span className="text-xs opacity-70">px</span>
                    </div>
                  </div>
                  <SliderControl
                    label="Bomb SVG / 红叉尺寸 (Size)"
                    value={demoCfg.sizePx}
                    min={10}
                    max={28}
                    step={1}
                    unit="px"
                    colorScheme="orange"
                    isLight={isLight}
                    onChange={(v) => updateDemoCfg({ sizePx: v })}
                  />
                  <div className="flex items-center gap-1 flex-wrap font-mono text-[11px]">
                    {[12, 14, 16, 18, 20, 22, 24].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateDemoCfg({ sizePx: sz })}
                        className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                          demoCfg.sizePx === sz
                            ? 'bg-red-600 text-white border-red-600 font-bold'
                            : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">指示器类型 (Variant)</span>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => updateDemoCfg({ variant: 'bomb-svg' })}
                        className={`px-2.5 py-0.5 rounded-lg border cursor-pointer flex items-center gap-1 ${
                          demoCfg.variant === 'bomb-svg'
                            ? 'bg-red-600 text-white border-red-600 font-bold'
                            : 'border-neutral-400/40 opacity-80'
                        }`}
                      >
                        <BombEmojiSvg size={12} color="currentColor" strokeWidth={2} />
                        <span>Bomb SVG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDemoCfg({ variant: 'cross' })}
                        className={`px-2.5 py-0.5 rounded-lg border cursor-pointer ${
                          demoCfg.variant === 'cross'
                            ? 'bg-red-600 text-white border-red-600 font-bold'
                            : 'border-neutral-400/40 opacity-80'
                        }`}
                      >
                        ✕ 经典红叉
                      </button>
                    </div>
                  </div>

                  <SliderControl
                    label="SVG 线条粗细 (Stroke Width)"
                    value={demoCfg.strokeWidth}
                    min={0.8}
                    max={3.2}
                    step={0.1}
                    unit=""
                    colorScheme="orange"
                    isLight={isLight}
                    onChange={(v) => updateDemoCfg({ strokeWidth: v })}
                  />
                </div>
              </div>

              {/* Row 3: Outer Glow & Respawn Bar Progress Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <SliderControl
                  label="外发光模糊半径 (Glow Blur)"
                  value={demoCfg.glowBlurPx}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                  colorScheme="amber"
                  isLight={isLight}
                  onChange={(v) => updateDemoCfg({ glowBlurPx: v })}
                />

                <SliderControl
                  label={`底部复活进度条 (${respawnStageLabel})`}
                  value={respawnRemSec}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  unit="s"
                  colorScheme="emerald"
                  isLight={isLight}
                  onChange={setRespawnRemSec}
                />
              </div>

              {/* Row 4: Color Swatches + Custom Color Input */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex-wrap">
                <span className="text-xs font-semibold">主色与发光配色 (Color & Glow):</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.hex}
                      type="button"
                      onClick={() => updateDemoCfg({ color: sw.hex, glowColor: sw.hex })}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border cursor-pointer flex items-center gap-1.5 transition-all ${
                        demoCfg.color.toUpperCase() === sw.hex
                          ? 'ring-2 ring-red-500 font-bold'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: `${sw.hex}88`,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: sw.hex }}
                      />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                  <input
                    type="color"
                    value={demoCfg.color}
                    onChange={(e) =>
                      updateDemoCfg({ color: e.target.value, glowColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    title="自定义颜色"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

EdgeDemoInspectorSection.displayName = 'EdgeDemoInspectorSection';
