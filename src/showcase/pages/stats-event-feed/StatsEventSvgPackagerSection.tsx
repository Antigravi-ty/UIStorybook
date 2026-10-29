import React from 'react';
import { Badge } from '../../../primitives/Badge';
import {
  PackagedSvgId, BombEmojiSvg, CrossbarSvg, BounceSvg,
  HighFiveSvg, TacticsSvg, StrategySvg,
} from '../../../primitives/packagedSvgIcons';
import type { StatsEventFeedItem } from '../../../hud/StatsEventFeedHUD';
export interface StatPresetDefinition extends StatsEventFeedItem {
  badgeLabel: string;
  sourceUrl: string;
  desc: string;
}

export const STAT_EVENT_PRESETS: StatPresetDefinition[] = [
  {
    id: 'crossbar-outline', badgeLabel: 'Crossbar #1 (7267515)',
    sourceUrl: 'https://thenounproject.com/icon/crossbar-7267515/',
    desc: '横梁击中 (描边版 7267515) · 图标 + 文本 + 球速胶囊 + 距离注脚', iconName: 'crossbar-outline',
    kickerText: 'ZEN_MASTER_RL · SHOT TELEMETRY', titleText: 'CROSSBAR PING',
    capsuleText: '118 KM/H', footnoteText: 'UPPER 90 IRON DEFLECTION · 0.42M FROM GOAL LINE',
    footnoteTag: '+15 PTS', accentColor: '#F59E0B',
  },
  {
    id: 'crossbar-solid', badgeLabel: 'Crossbar #2 (7267457)',
    sourceUrl: 'https://thenounproject.com/icon/crossbar-7267457/',
    desc: '横梁反弹 (实心版 7267457) · 高对比实心球体与球门横梁反弹轨迹', iconName: 'crossbar-solid',
    kickerText: 'BEAST_MODE · DOUBLE TAP', titleText: 'BACKBOARD CROSSBAR',
    capsuleText: '+40 PTS', footnoteText: 'REBOUND ANGLE 34.2° · AIR HANGTIME 1.84S',
    footnoteTag: 'TICK #14,280', accentColor: '#38BDF8',
  },
  {
    id: 'bounce-solid', badgeLabel: 'Bounce 实心单线 (7384294)',
    sourceUrl: 'https://thenounproject.com/icon/bounce-7384294/',
    desc: '改写变体：轨迹线与地面平台改为实心单线，球体保持正常描边', iconName: 'bounce-solid',
    kickerText: 'OCTANE_99 · HALF-VOLLEY TIMING', titleText: 'POWER BOUNCE READ',
    capsuleText: 'FRAME +1', footnoteText: 'SOLID SINGLE-LINE TRAJECTORY & PLATFORM · OUTLINED BALL',
    footnoteTag: '124 KM/H', accentColor: '#10B981',
  },
  {
    id: 'bounce-outline', badgeLabel: 'Bounce 原版描边 (7384294)',
    sourceUrl: 'https://thenounproject.com/icon/bounce-7384294/',
    desc: '原版空心双线轨迹与底座描边 (Bounce 7384294 Original)', iconName: 'bounce-outline',
    kickerText: 'OCTANE_99 · PITCH CONTACT', titleText: 'FIRST BOUNCE CONTROL',
    capsuleText: '+20 PTS', footnoteText: 'ORIGINAL DOUBLE-OUTLINE TRAJECTORY & PLATFORM',
    footnoteTag: '0.08S DELTA', accentColor: '#34D399',
  },
  {
    id: 'high-five', badgeLabel: 'High-Five 2³=8 (1154833)',
    sourceUrl: 'https://thenounproject.com/icon/high-five-1154833/',
    desc: '空中击掌庆祝 · 支持 3 个 Toggle 开关 (上下放射线 / 左手实心 / 右手实心 = 8种组合)', iconName: 'high-five',
    kickerText: 'TEAM SYNERGY · POST-GOAL', titleText: 'AERIAL HIGH FIVE',
    capsuleText: '+100 PTS', footnoteText: 'MID-AIR TEAMMATE COLLISION · ALTITUDE 642 UU',
    footnoteTag: 'RARE STAT', accentColor: '#F43F5E',
  },
  {
    id: 'tactics-square', badgeLabel: 'Tactics 1:1 正方形 (6112985)',
    sourceUrl: 'https://thenounproject.com/icon/tactics-6112985/',
    desc: 'Playmaker 战术板 1:1 正方形改写变体 (对角 O/X 布局 + 倾斜战术曲线箭头)', iconName: 'tactics-square',
    kickerText: 'PLAYMAKER · PASSING LANE', titleText: 'TACTICAL PLAYMAKER',
    capsuleText: 'ASSIST ×2', footnoteText: '1:1 SQUARE VARIATION · ANGLED S-CURVE ARROW',
    footnoteTag: '+50 PTS', accentColor: '#A855F7',
  },
  {
    id: 'tactics-original', badgeLabel: 'Tactics 原版 (6112985)',
    sourceUrl: 'https://thenounproject.com/icon/tactics-6112985/',
    desc: 'Playmaker 战术板原版纵向构图 (Original 6112985)', iconName: 'tactics',
    kickerText: 'PLAYMAKER · INFIELD PASS', titleText: 'INFIELD TACTICS',
    capsuleText: '+35 PTS', footnoteText: 'ORIGINAL VERTICAL ASPECT · S-CURVE ROUTE',
    footnoteTag: 'EXPECTED GOAL 0.78', accentColor: '#C084FC',
  },
  {
    id: 'strategy', badgeLabel: 'Strategy 2²=4 (6112585)',
    sourceUrl: 'https://thenounproject.com/icon/strategy-6112585/',
    desc: '战术走位板 · 支持 2 个 Toggle 将左上或右下 X 切换为 O 圆环 (4种组合)', iconName: 'strategy',
    kickerText: 'ROTATION ENGINE · THIRD MAN', titleText: 'STRATEGY SHIFT',
    capsuleText: '2-1-2 LOCK', footnoteText: 'DUAL X→O TOGGLE SWITCHES · DIAGONAL PRESS',
    footnoteTag: 'ZONE C', accentColor: '#06B6D4',
  },
  {
    id: 'bomb-demo', badgeLabel: 'Bomb Emoji (528868)',
    sourceUrl: 'https://www.svgrepo.com/svg/528868/bomb-emoji',
    desc: 'SVG Repo 528868 矢量炸弹 · 无内置固定色，支持粗细、颜色、外发光自由调节', iconName: 'bomb-emoji',
    kickerText: 'ENFORCER · SUPERSONIC IMPACT', titleText: 'EXTERMINATION DEMO',
    capsuleText: '3.0S RESPAWN', footnoteText: 'IMPACT SPEED 2,240 UU/S · OPPONENT SLOT #4 CLEARED',
    footnoteTag: 'BOOM ×3', accentColor: '#EF4444',
  },
];
export const ACCENT_SWATCHES = [
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#38BDF8', name: 'Sky' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#FFFFFF', name: 'White' },
] as const;
export interface StatsEventSvgPackagerSectionProps {
  isLight: boolean;
  previewSizePx: number;
  setPreviewSizePx: React.Dispatch<React.SetStateAction<number>>;
  previewGlowBlur: number;
  setPreviewGlowBlur: React.Dispatch<React.SetStateAction<number>>;
  previewGlowIntensity: number;
  previewColor: string;
  setPreviewColor: React.Dispatch<React.SetStateAction<string>>;
  highFiveShowSparks: boolean;
  setHighFiveShowSparks: React.Dispatch<React.SetStateAction<boolean>>;
  highFiveFillLeft: boolean;
  setHighFiveFillLeft: React.Dispatch<React.SetStateAction<boolean>>;
  highFiveFillRight: boolean;
  setHighFiveFillRight: React.Dispatch<React.SetStateAction<boolean>>;
  highFiveBitCode: number;
  strategyTopLeftCircle: boolean;
  setStrategyTopLeftCircle: React.Dispatch<React.SetStateAction<boolean>>;
  strategyBottomRightCircle: boolean;
  setStrategyBottomRightCircle: React.Dispatch<React.SetStateAction<boolean>>;
  strategyBitCode: number;
  setBounceSolidLine: React.Dispatch<React.SetStateAction<boolean>>;
  setTacticsSquareMode: React.Dispatch<React.SetStateAction<boolean>>;
  setCrossbarSolidMode: React.Dispatch<React.SetStateAction<boolean>>;
  bombStrokeWidth: number;
  setBombStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
  customIconName: PackagedSvgId;
  setCustomIconName: React.Dispatch<React.SetStateAction<PackagedSvgId>>;
}

export const StatsEventSvgPackagerSection: React.FC<StatsEventSvgPackagerSectionProps> = ({
  isLight,
  previewSizePx,
  setPreviewSizePx,
  previewGlowBlur,
  setPreviewGlowBlur,
  previewGlowIntensity,
  previewColor,
  setPreviewColor,
  highFiveShowSparks,
  setHighFiveShowSparks,
  highFiveFillLeft,
  setHighFiveFillLeft,
  highFiveFillRight,
  setHighFiveFillRight,
  highFiveBitCode,
  strategyTopLeftCircle,
  setStrategyTopLeftCircle,
  strategyBottomRightCircle,
  setStrategyBottomRightCircle,
  strategyBitCode,
  setBounceSolidLine,
  setTacticsSquareMode,
  setCrossbarSolidMode,
  bombStrokeWidth,
  setBombStrokeWidth,
  customIconName,
  setCustomIconName,
}) => {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-6 w-6 rounded-md bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold text-xs font-mono">
            5F.3
          </div>
          <h2 className="text-base font-bold tracking-tight">
            Additional SVG Preview &amp; Variation Configurator · 独立打包矢量图标与多维 Toggle 矩阵
          </h2>
          <Badge variant="danger" size="sm" isLight={isLight}>
            High-Five 2³=8 · Strategy 2²=4 · Bounce 单线实心 · Tactics 1:1 正方形 · Bomb 粗细/发光
          </Badge>
        </div>
        {/* Global Preview Size / Color / Glow Controls */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          <label className="flex items-center gap-1.5">
            <span className="opacity-75">预览尺寸:</span>
            <input type="range" min={28} max={72} value={previewSizePx}
              onChange={(e) => setPreviewSizePx(Number(e.target.value))} className="w-20 accent-rose-500" />
            <span className="font-bold">{previewSizePx}px</span>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="opacity-75">外发光:</span>
            <input type="range" min={0} max={18} value={previewGlowBlur}
              onChange={(e) => setPreviewGlowBlur(Number(e.target.value))} className="w-20 accent-rose-500" />
            <span className="font-bold">{previewGlowBlur}px</span>
          </label>
          <div className="flex items-center gap-1">
            {ACCENT_SWATCHES.map((sw) => (
              <button
                key={sw.hex} type="button"
                onClick={() => setPreviewColor(sw.hex)}
                className={`w-4 h-4 rounded-full cursor-pointer border ${
                  previewColor.toUpperCase() === sw.hex ? 'scale-125 border-white ring-2 ring-rose-500'
                    : 'border-black/30 opacity-80' }`}
                style={{ backgroundColor: sw.hex }} title={sw.name}
              />
            ))}
          </div>
        </div>
      </div>
      {/* 1. HIGH-FIVE (1154833) 3-BIT TOGGLE & 2^3 = 8 COMBINATIONS MATRIX */}
      <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${ isLight
        ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-mono font-bold text-rose-500">
              A. High-Five (`thenounproject.com/icon/high-five-1154833`) · 3-Bit Toggle ($2^3 = 8$ 排列组合)
            </span>
            <span className="text-[11px] opacity-75">
              3 个独立布尔数位开关：`showSparks` (上下各3条共6条放射线) × `fillLeftHand` (左手变实心) × `fillRightHand` (右手变实心)
            </span>
          </div>
          {/* 3 Toggle Switches */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <button
              type="button" onClick={() => setHighFiveShowSparks((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border cursor-pointer font-bold transition-all ${
                highFiveShowSparks ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-neutral-400/40 opacity-75' }`}
            >
              Bit 2 · 上下6条线: {highFiveShowSparks ? 'ON (1)' : 'OFF (0)'}
            </button>
            <button
              type="button" onClick={() => setHighFiveFillLeft((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border cursor-pointer font-bold transition-all ${
                highFiveFillLeft ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-neutral-400/40 opacity-75' }`}
            >
              Bit 1 · 左手实心: {highFiveFillLeft ? 'ON (1)' : 'OFF (0)'}
            </button>
            <button
              type="button" onClick={() => setHighFiveFillRight((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border cursor-pointer font-bold transition-all ${
                highFiveFillRight ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-neutral-400/40 opacity-75' }`}
            >
              Bit 0 · 右手实心: {highFiveFillRight ? 'ON (1)' : 'OFF (0)'}
            </button>
          </div>
        </div>
        {/* 8-State Grid (000 to 111) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((mask) => {
            const sparks = Boolean(mask & 4);
            const leftSolid = Boolean(mask & 2);
            const rightSolid = Boolean(mask & 1);
            const bits = `${sparks ? 1 : 0}${leftSolid ? 1 : 0}${rightSolid ? 1 : 0}`;
            const isCurrent = highFiveBitCode === mask;
            return (
              <button
                key={mask} type="button"
                onClick={() => {
                  setHighFiveShowSparks(sparks);
                  setHighFiveFillLeft(leftSolid);
                  setHighFiveFillRight(rightSolid);
                  setCustomIconName('high-five');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  isCurrent ? 'bg-rose-500/15 border-rose-500 ring-1 ring-rose-500/60'
                    : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                    : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
              >
                <div className="h-16 flex items-center justify-center">
                  <HighFiveSvg size={previewSizePx} color={previewColor} glowColor={previewColor}
                    glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} showSparks={sparks}
                    fillLeftHand={leftSolid} fillRightHand={rightSolid} />
                </div>
                <span className="text-[11px] font-mono font-bold text-rose-500">#{mask} (`{bits}`)</span>
                <span className="text-[10px] font-mono opacity-75 text-center leading-tight">
                  {sparks ? '有6线' : '无6线'} · {leftSolid ? '左实' : '左空'} ·{' '}
                  {rightSolid ? '右实' : '右空'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* 2. STRATEGY (6112585) 2-BIT TOGGLE (2^2 = 4) & BOUNCE (7384294) SOLID SINGLE-LINE VS OUTLINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strategy 2^2 = 4 */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono font-bold text-cyan-500">
                B. Strategy (`strategy-6112585`) · 双 Toggle 开关 ($2^2 = 4$ 组合)
              </span>
              <span className="text-[11px] opacity-75">原版带两个 `X` (左上 + 右下)，可分别独立切换为 `O` 圆环</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button" onClick={() => setStrategyTopLeftCircle((v) => !v)}
                className={`px-2 py-0.5 rounded border cursor-pointer font-bold ${
                  strategyTopLeftCircle ? 'bg-cyan-500 text-neutral-950 border-cyan-500'
                    : 'border-neutral-400/40 opacity-80' }`}
              >
                左上: {strategyTopLeftCircle ? 'O 圆' : 'X 叉'}
              </button>
              <button
                type="button" onClick={() => setStrategyBottomRightCircle((v) => !v)}
                className={`px-2 py-0.5 rounded border cursor-pointer font-bold ${
                  strategyBottomRightCircle ? 'bg-cyan-500 text-neutral-950 border-cyan-500'
                    : 'border-neutral-400/40 opacity-80' }`}
              >
                右下: {strategyBottomRightCircle ? 'O 圆' : 'X 叉'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((mask) => {
              const tlCircle = Boolean(mask & 2);
              const brCircle = Boolean(mask & 1);
              const isCurrent = strategyBitCode === mask;
              return (
                <button
                  key={mask} type="button"
                  onClick={() => {
                    setStrategyTopLeftCircle(tlCircle);
                    setStrategyBottomRightCircle(brCircle);
                    setCustomIconName('strategy');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    isCurrent ? 'bg-cyan-500/15 border-cyan-500 ring-1 ring-cyan-500/60'
                      : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                      : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
                >
                  <div className="h-16 flex items-center justify-center">
                    <StrategySvg size={previewSizePx} color={previewColor} glowColor={previewColor}
                      glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} topLeftCircle={tlCircle}
                      bottomRightCircle={brCircle} />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-500">
                    左上 {tlCircle ? 'O' : 'X'} · 右下 {brCircle ? 'O' : 'X'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Bounce (7384294) Original vs Solid Single-Line + Tactics (6112985) Original vs 1:1 Square */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
          <span className="text-xs font-mono font-bold text-emerald-500">
            C. Bounce (`7384294` 实心单线改写) &amp; Tactics (`6112985` 1:1 正方形改写)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button" onClick={() => {
                setBounceSolidLine(true);
                setCustomIconName('bounce-solid');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                customIconName === 'bounce-solid'
                  ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/60' : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
            >
              <div className="h-16 flex items-center justify-center">
                <BounceSvg solidTrajectoryAndPlatform={true} size={previewSizePx} color={previewColor}
                  glowColor={previewColor} glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-500">Bounce 实心单线</span>
              <span className="text-[10px] font-mono opacity-75 text-center leading-tight">轨迹+底座单线 · 球正常描边</span>
            </button>
            <button
              type="button" onClick={() => {
                setBounceSolidLine(false);
                setCustomIconName('bounce-outline');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                customIconName === 'bounce-outline'
                  ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/60' : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
            >
              <div className="h-16 flex items-center justify-center">
                <BounceSvg solidTrajectoryAndPlatform={false} size={previewSizePx} color={previewColor}
                  glowColor={previewColor} glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-500">Bounce 原版描边</span>
              <span className="text-[10px] font-mono opacity-75 text-center leading-tight">7384294 双线空心原版</span>
            </button>
            <button
              type="button" onClick={() => {
                setTacticsSquareMode(true);
                setCustomIconName('tactics-square');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                customIconName === 'tactics-square'
                  ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500/60' : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
            >
              <div className="h-16 flex items-center justify-center">
                <TacticsSvg squareVariation={true} size={previewSizePx} color={previewColor}
                  glowColor={previewColor} glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-500">Tactics 1:1 正方形</span>
              <span className="text-[10px] font-mono opacity-75 text-center leading-tight">对角构图 + 斜向箭头变体</span>
            </button>
            <button
              type="button" onClick={() => {
                setTacticsSquareMode(false);
                setCustomIconName('tactics');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                customIconName === 'tactics'
                  ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500/60' : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
            >
              <div className="h-16 flex items-center justify-center">
                <TacticsSvg squareVariation={false} size={previewSizePx} color={previewColor}
                  glowColor={previewColor} glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-500">Tactics 原版</span>
              <span className="text-[10px] font-mono opacity-75 text-center leading-tight">6112985 纵向原版保留</span>
            </button>
          </div>
        </div>
      </div>
      {/* 3. CROSSBAR (7267515 vs 7267457) & BOMB EMOJI (528868) STROKE / GLOW TUNER */}
      <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${ isLight
        ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-amber-500">
            D. Crossbar (`7267515` 描边 vs `7267457` 实心) &amp; Bomb Emoji (`528868` 无色矢量 · 粗细/发光调节)
          </span>
          <label className="flex items-center gap-2 text-xs font-mono">
            <span className="opacity-75">Bomb 线条粗细 (`strokeWidth`):</span>
            <input type="range" min={1.0} max={3.2} step={0.1} value={bombStrokeWidth}
              onChange={(e) => setBombStrokeWidth(Number(e.target.value))} className="w-28 accent-red-500" />
            <span className="font-bold text-red-500">{bombStrokeWidth.toFixed(1)}px</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button" onClick={() => {
              setCrossbarSolidMode(false);
              setCustomIconName('crossbar-outline');
            }} className={`p-3 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
              customIconName === 'crossbar-outline' ? 'bg-amber-500/15 border-amber-500'
                : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
          >
            <CrossbarSvg variant="outline" size={previewSizePx} color={previewColor} glowColor={previewColor}
              glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
            <div className="flex flex-col text-left font-mono">
              <span className="text-xs font-bold">Crossbar #1 (7267515)</span>
              <span className="text-[10px] opacity-75">描边版球体 + 横梁底进网路线</span>
            </div>
          </button>
          <button
            type="button" onClick={() => {
              setCrossbarSolidMode(true);
              setCustomIconName('crossbar-solid');
            }} className={`p-3 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
              customIconName === 'crossbar-solid' ? 'bg-amber-500/15 border-amber-500'
                : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
          >
            <CrossbarSvg variant="solid" size={previewSizePx} color={previewColor} glowColor={previewColor}
              glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
            <div className="flex flex-col text-left font-mono">
              <span className="text-xs font-bold">Crossbar #2 (7267457)</span>
              <span className="text-[10px] opacity-75">实心版球体 + 横梁反弹轨迹</span>
            </div>
          </button>
          <button
            type="button" onClick={() => setCustomIconName('bomb-emoji')}
            className={`p-3 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
              customIconName === 'bomb-emoji' ? 'bg-red-500/15 border-red-500'
                : isLight ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                : 'bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800' }`}
          >
            <BombEmojiSvg size={previewSizePx} color={previewColor} strokeWidth={bombStrokeWidth}
              glowColor={previewColor} glowBlurPx={previewGlowBlur} glowIntensityPct={previewGlowIntensity} />
            <div className="flex flex-col text-left font-mono">
              <span className="text-xs font-bold">Bomb Emoji (528868)</span>
              <span className="text-[10px] opacity-75">strokeWidth={bombStrokeWidth.toFixed(1)} · 纯描边无底色</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
