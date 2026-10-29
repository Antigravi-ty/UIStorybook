import React from 'react';

export interface HudBoostGaugeGeometryControlsProps {
  isLight: boolean;
  inputCls: string;
  ringInnerPct: number;
  ringOuterPct: number;
  setRingInnerPct: (v: number) => void;
  setRingOuterPct: (v: number) => void;
  updateTokens: (patch: { ringInnerPct?: number; ringOuterPct?: number }) => void;
  cutoutAngleDeg: number;
  cutoutInputText: string;
  setCutoutInputText: (v: string) => void;
  setCutoutAngleDeg: (v: number) => void;
  handleSetCutoutDeg: (val: number) => void;
  rotationDeg: number;
  rotationInputText: string;
  setRotationInputText: (v: string) => void;
  setRotationDeg: (v: number) => void;
  handleSetRotationDeg: (val: number) => void;
  gaugeSize: number;
  handleSetGaugeSize: (s: number) => void;
  lineCap: 'round' | 'butt';
  setLineCap: (cap: 'round' | 'butt') => void;
}

export const HudBoostGaugeGeometryControls: React.FC<HudBoostGaugeGeometryControlsProps> = ({
  isLight,
  inputCls,
  ringInnerPct,
  ringOuterPct,
  setRingInnerPct,
  setRingOuterPct,
  updateTokens,
  cutoutAngleDeg,
  cutoutInputText,
  setCutoutInputText,
  setCutoutAngleDeg,
  handleSetCutoutDeg,
  rotationDeg,
  rotationInputText,
  setRotationInputText,
  setRotationDeg,
  handleSetRotationDeg,
  gaugeSize,
  handleSetGaugeSize,
  lineCap,
  setLineCap,
}) => {
  return (
    <>
      {/* 4. Outer Ring Thickness: Start % (ringInnerPct) & End % (ringOuterPct) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold">
            外框粗细 · 底部大圆起始百分比 (`{ringInnerPct}%`) 与结束百分比 (`{ringOuterPct}%`):
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px] flex-wrap">
            {[
              { label: '60%~98% (校准默认·圆头推荐)', inner: 60, outer: 98 },
              { label: '50%~55% (细内环)', inner: 50, outer: 55 },
              { label: '72%~84% (经典中等)', inner: 72, outer: 84 },
              { label: '60%~100% (粗环贴外沿)', inner: 60, outer: 100 },
              { label: '76%~100% (中环贴外沿)', inner: 76, outer: 100 },
              { label: '0%~100% (实心扇形饼图)', inner: 0, outer: 100 },
            ].map((p) => {
              const active = ringInnerPct === p.inner && ringOuterPct === p.outer;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    updateTokens({
                      ringInnerPct: p.inner,
                      ringOuterPct: p.outer,
                    });
                  }}
                  className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 font-bold'
                      : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] opacity-80">起始半径百分比 (Start %):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={98}
                  step={1}
                  value={ringInnerPct}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) {
                      const nextInner = Math.max(0, Math.min(98, v));
                      setRingInnerPct(nextInner);
                      if (ringOuterPct <= nextInner) {
                        setRingOuterPct(Math.min(100, nextInner + 2));
                      }
                    }
                  }}
                  className={`w-14 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                />
                <span className="text-[11px] opacity-70">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={96}
              step={1}
              value={ringInnerPct}
              onChange={(e) => {
                const nextInner = Number(e.target.value);
                setRingInnerPct(nextInner);
                if (ringOuterPct <= nextInner) {
                  setRingOuterPct(Math.min(100, nextInner + 2));
                }
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] opacity-80">结束半径百分比 (End % · 100%贴边):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={2}
                  max={100}
                  step={1}
                  value={ringOuterPct}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) {
                      const nextOuter = Math.max(2, Math.min(100, v));
                      setRingOuterPct(nextOuter);
                      if (ringInnerPct >= nextOuter) {
                        setRingInnerPct(Math.max(0, nextOuter - 2));
                      }
                    }
                  }}
                  className={`w-14 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
                />
                <span className="text-[11px] opacity-70">%</span>
              </div>
            </div>
            <input
              type="range"
              min={4}
              max={100}
              step={1}
              value={ringOuterPct}
              onChange={(e) => {
                const nextOuter = Number(e.target.value);
                setRingOuterPct(nextOuter);
                if (ringInnerPct >= nextOuter) {
                  setRingInnerPct(Math.max(0, nextOuter - 2));
                }
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Cutout Angle (0°~359°) & Rotation Angle (Any Number Text Input + Presets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">裁切角度 (`cutoutAngleDeg`)</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="text"
                value={cutoutInputText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setCutoutInputText(raw);
                  const parsed = parseFloat(raw);
                  if (!Number.isNaN(parsed)) {
                    setCutoutAngleDeg(Math.max(0, Math.min(359.5, parsed)));
                  }
                }}
                placeholder="任意度数"
                className={`w-16 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
              />
              <span className="text-xs opacity-70">°</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={300}
            step={1}
            value={Math.min(300, cutoutAngleDeg)}
            onChange={(e) => handleSetCutoutDeg(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
            {[
              { deg: 0, label: '0° 完整圆环' },
              { deg: 60, label: '60° 微裁' },
              { deg: 90, label: '90° 默认' },
              { deg: 120, label: '120° 大圆弧' },
              { deg: 180, label: '180° 半圆' },
            ].map((preset) => (
              <button
                key={preset.deg}
                type="button"
                onClick={() => handleSetCutoutDeg(preset.deg)}
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                  Math.abs(cutoutAngleDeg - preset.deg) < 0.1
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">旋转角度 / 开口方向 (`rotationDeg`)</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="text"
                value={rotationInputText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setRotationInputText(raw);
                  const parsed = parseFloat(raw);
                  if (!Number.isNaN(parsed)) {
                    setRotationDeg(parsed);
                  }
                }}
                placeholder="任意度数"
                className={`w-16 px-1.5 py-0.5 rounded border text-xs font-bold text-center tabular-nums ${inputCls}`}
              />
              <span className="text-xs opacity-70">°</span>
            </div>
          </div>

          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={Math.max(-180, Math.min(180, rotationDeg))}
            onChange={(e) => handleSetRotationDeg(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
            {[
              { deg: 0, label: '开口朝下(0°)' },
              { deg: -45, label: '开口朝右下(-45°)' },
              { deg: -90, label: '开口朝右(-90°)' },
              { deg: 45, label: '开口朝左下(+45°)' },
              { deg: 90, label: '开口朝左(+90°)' },
              { deg: 180, label: '开口朝上(180°)' },
            ].map((preset) => (
              <button
                key={preset.deg}
                type="button"
                onClick={() => handleSetRotationDeg(preset.deg)}
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                  Math.abs(rotationDeg - preset.deg) < 0.1
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                    : 'border-neutral-400/40 opacity-80 hover:opacity-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Size & LineCap */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-xs font-semibold mr-1">表盘外径 (Size):</span>
          {[128, 148, 168, 188].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSetGaugeSize(s)}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                gaugeSize === s
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-xs font-semibold">端点样式 (LineCap):</span>
          {(['round', 'butt'] as const).map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => setLineCap(cap)}
              className={`px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                lineCap === cap
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                  : 'border-neutral-400/40 opacity-75'
              }`}
            >
              {cap === 'round' ? 'Round (圆头)' : 'Butt (平切)'}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
