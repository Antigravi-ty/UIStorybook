import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:temporal-overlay');
import { Clock, Compass, Flame, Gauge, Hash, Hourglass, Play, RotateCcw, Zap, } from 'lucide-react';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { SliderControl } from '../../primitives/SliderControl';
import { createHudTransientChannel } from '../../hud/hudTransientChannel';
import { TemporalReplayFooterHUD } from '../../hud/TemporalReplayFooterHUD';
import { DemolishHourglassTimerHUD } from '../../hud/DemolishHourglassTimerHUD';
import { PitchMiniMapHUD } from '../../hud/PitchMiniMapHUD';
import { DualLayerBoostPieHUD } from '../../hud/DualLayerBoostPieHUD';
import { STEP_12_TIER_PRESETS } from '../../hud/CircularBoostGauge';
import { DigitSlotReelHUD } from '../../hud/DigitSlotReelHUD';
import { KickoffCountdownFlashHUD } from '../../hud/KickoffCountdownFlashHUD';
import { ArenaBackdrop } from '../../hud/ArenaBackdrop';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';

const T5A_DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  { id: 't5a-1-replay-footer', code: 'T5A.1', name: 'TemporalReplayFooterHUD', label: '斜面切角玻璃回放底栏 + 动态SVG发光顶边' },
  { id: 't5a-2-respawn-hourglass', code: 'T5A.2',
    name: 'DemolishHourglassTimerHUD', label: '3阶段变色沙漏复活倒计时 (3s→0s 双侧内缩)' },
  { id: 't5a-3-pitch-minimap', code: 'T5A.3', name: 'PitchMiniMapHUD', label: '34垫位八角球场小地图 + 球速外环 + 180°翻转' },
  { id: 't5a-4-boost-pie', code: 'T5A.4', name: 'DualLayerBoostPieHUD', label: '双层扇形幽灵残影饼图 (120Hz SVG Path Ref)' },
  { id: 't5a-5-digit-slot-reel', code: 'T5A.5', name: 'DigitSlotReelHUD', label: '三列老虎机滚轮数字计数器 (0重排 translate3d)' },
  { id: 't5a-6-countdown-flash', code: 'T5A.6',
    name: 'KickoffCountdownFlashHUD', label: '开球倒计时双层描边缩放闪字 (4-3-2-1-GO!)' },
];

export const TemporalOverlayPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  // Unified 120Hz Transient Channel driving all 6 T5A components with 0 React re-renders during high-freq streaming
  const channelRef = useRef(
    createHudTransientChannel({
      boostAmount: 74,
      replayFooter: {
        visible: true,
        scorerName: 'Vatira_KC',
        goalSpeed: '118KPH',
        assisterName: 'Atow.',
        teamAccentColor: '#edce0b',
      },
      respawnTimer: {
        remainingSeconds: 2.35,
        totalSeconds: 3.0,
        active: true,
      },
      miniMap: {
        ballX: 62,
        ballY: 34,
        ballHitKph: 114,
        isFlipped: false,
      },
      countdownFlash: {
        value: 3,
      },
    })
  );

  // Low-frequency interactive controls (pushing directly to channelRef.current)
  const [autoStream120Hz, setAutoStream120Hz] = useState(true);
  const [replayVisible, setReplayVisible] = useState(true);
  const [scorerName, setScorerName] = useState('Vatira_KC');
  const [goalSpeed, setGoalSpeed] = useState(118);
  const [assisterName, setAssisterName] = useState('Atow.');
  const [teamAccentColor, setTeamAccentColor] = useState('#edce0b');

  const [respawnRemSec, setRespawnRemSec] = useState(2.35);
  const [respawnAutoLoop, setRespawnAutoLoop] = useState(true);

  const [miniMapFlipped, setMiniMapFlipped] = useState(false);
  const [ballHitKph, setBallHitKph] = useState(114);
  const [ballX, setBallX] = useState(62);
  const [ballY, setBallY] = useState(34);

  const [boostVal, setBoostVal] = useState(74);
  const [countdownVal, setCountdownVal] = useState<4 | 3 | 2 | 1 | 0 | null>(3);

  const respawnReadoutRef = useRef<HTMLSpanElement | null>(null);
  const boostReadoutRef = useRef<HTMLSpanElement | null>(null);

  // 120Hz Transient rAF Loop (updates Respawn Timer, MiniMap Ball Trajectory, Boost Pie & Slot Reel without React re-renders!)
  useEffect(() => {
    if (!autoStream120Hz) return;
    const ch = channelRef.current;
    let rafId = 0;
    let startTs = performance.now();
    let scrollCooldownUntil = 0;

    const onScrollCapture = () => {
      scrollCooldownUntil = performance.now() + 90;
    };
    window.addEventListener('scroll', onScrollCapture, { capture: true, passive: true });

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (now < scrollCooldownUntil || document.hidden) return;
      const elapsedSec = (now - startTs) / 1000;

      // 1. 3.0s Demolish Respawn Countdown loop (`T5A.2`)
      if (respawnAutoLoop) {
        const cycle = elapsedSec % 3.4;
        const rem = cycle <= 3.0 ? Math.max(0, 3.0 - cycle) : 0;
        ch.setRespawnTimer({
          remainingSeconds: rem,
          totalSeconds: 3.0,
          active: true,
        });
        if (respawnReadoutRef.current) {
          const stage =
            rem > 2.0
              ? 'STAGE 1 · WHITE/INK (3s→2s)'
              : rem > 1.0
              ? 'STAGE 2 · YELLOW (2s→1s)'
              : rem > 0
              ? 'STAGE 3 · RED (1s→0s)'
              : 'RESPAWNED (0.0s)';
          respawnReadoutRef.current.textContent = `${rem.toFixed(2)}s / 3.00s · ${stage}`;
        }
      }

      // 2. MiniMap ball orbital trajectory (`T5A.3`)
      const phase = now * 0.0014;
      const simBx = 50 + Math.cos(phase) * 28;
      const simBy = 50 + Math.sin(phase * 1.3) * 32;
      const simKph = Math.round(95 + Math.abs(Math.cos(phase * 1.7)) * 65);
      ch.setMiniMap({
        ballX: simBx,
        ballY: simBy,
        ballHitKph: simKph,
      });

      // 3. Boost Pie & Slot Reel synchronized 120Hz wave (`T5A.4` & `T5A.5`)
      const simBoost = Math.round(50 + Math.sin(phase * 0.85) * 48);
      ch.setBoost(simBoost, false);
      if (boostReadoutRef.current) {
        boostReadoutRef.current.textContent = `${simBoost}%`;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollCapture, { capture: true });
    };
  }, [autoStream120Hz, respawnAutoLoop]);

  const cardClass = isLight
    ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
    : 'bg-neutral-900/90 border-neutral-800 text-neutral-100 shadow-lg';

  const subPanelClass = isLight
    ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
    : 'bg-neutral-950/75 border-neutral-800 text-neutral-200';

  const previewStageClass = isLight
    ? 'bg-slate-100/90 border-neutral-300 text-neutral-900'
    : 'bg-[#090D16] border-neutral-800 text-white';

  return (
      <div className="flex flex-col gap-8 pb-16">
        {/* Top Jump Directory */}
        <PageJumpDirectory layerTag="Layer T5A · High-Frequency Temporal HUD Widgets"
          title="Temporal Overlay HUD Catalog (0-React-Rerender Transient Architecture)"
          subtitle="已移除冗余 Integrated Panels；全部 6 个核心小组件均已解耦为 src/hud/ 独立组件，接入 hudTransientChannel 120Hz DOM/SVG Ref 直写并完整适配 Light/Dark 模式。"
          items={T5A_DIRECTORY_ITEMS} isLight={isLight} />

        {/* Global 120Hz Transient Stream Switch */}
        <div
          className={`px-4 py-3 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${subPanelClass}`}
        >
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold font-mono">
              T5A 120Hz Transient Channel Stream (`createHudTransientChannel`)
            </span>
            <Badge variant={autoStream120Hz ? 'success' : 'neutral'} size="sm" isLight={isLight}>
              {autoStream120Hz ? '120HZ LIVE · 0 REACT RE-RENDERS' : 'MANUAL SLIDER MODE'}
            </Badge>
          </div>
          <Button
            variant={autoStream120Hz ? 'primary' : 'secondary'}
            size="sm"
            isLight={isLight}
            onClick={() => setAutoStream120Hz((v) => !v)}
          >
            {autoStream120Hz ? '暂停 120Hz 自动推流 (切换手动精调)' : '开启 120Hz 自动推流'}
          </Button>
        </div>

        {/* =====================================================================
            T5A.1: TemporalReplayFooterHUD
           ===================================================================== */}
        <section id="t5a-1-replay-footer"
          className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
          <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" isLight={isLight}>
                T5A.1
              </Badge>
              <h2 className="text-base font-bold font-mono">
                TemporalReplayFooterHUD (`src/hud/TemporalReplayFooterHUD.tsx`)
              </h2>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeReplayFooter · ResizeObserver SVG Border
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={replayVisible ? 'primary' : 'secondary'} size="sm" isLight={isLight}
                onClick={() => { const next = !replayVisible; setReplayVisible(next);
                channelRef.current.setReplayFooter({ visible: next }); }} >
                <Play className="h-3.5 w-3.5 mr-1 inline" />
                {replayVisible ? '收起底栏 (Slide Out 0.65s)' : '弹出底栏 (Slide In 0.75s)'} </Button> </div> </div>
                {/* Interactive Controls */}
                <div className={`p-3.5 rounded-2xl border grid grid-cols-1 md:grid-cols-4 gap-3 ${subPanelClass}`}>
                <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono opacity-75">进球球员 (Scorer)</label> <input type="text"
                value={scorerName} onChange={(e) => { setScorerName(e.target.value);
                channelRef.current.setReplayFooter({ scorerName: e.target.value }); }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono ${ isLight
                ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-white'
                }`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono opacity-75">助攻球员 (Assister · 留空隐藏)</label>
              <input type="text" value={assisterName} onChange={(e) => { setAssisterName(e.target.value);
                channelRef.current.setReplayFooter({ assisterName: e.target.value }); }} placeholder="留空自动隐藏助攻图标"
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono ${ isLight
                ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-white'
                }`} />
            </div>

            <div>
              <SliderControl label="Goal Speed" value={goalSpeed} min={40} max={216} step={1} unit=" KPH"
                isLight={isLight} onChange={(v) => { setGoalSpeed(v);
                channelRef.current.setReplayFooter({ goalSpeed: `${v}KPH` }); }} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono opacity-75">队伍主题光效 (Team Accent)</span>
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: 'Gold', hex: '#edce0b' },
                  { label: 'Blue', hex: '#3b82f6' },
                  { label: 'Orange', hex: '#f97316' },
                  { label: 'Emerald', hex: '#10b981' },
                ].map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => {
                      setTeamAccentColor(sw.hex);
                      channelRef.current.setReplayFooter({ teamAccentColor: sw.hex });
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                      teamAccentColor === sw.hex ? 'ring-2 ring-amber-500' : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: `${sw.hex}22`,
                      borderColor: sw.hex,
                      color: isLight ? '#0f172a' : '#f8fafc',
                    }}
                  >
                    {sw.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Stage */}
          <div className="relative w-full h-[215px] rounded-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden bg-black">
            <ArenaBackdrop preset={isLight ? 'daylight' : 'night'} brightness={isLight ? 72 : 34} />
            <TemporalReplayFooterHUD
              isLight={isLight}
              subscribeReplayFooter={channelRef.current.subscribeReplayFooter}
            />
          </div>
        </section>

        {/* =====================================================================
            T5A.2: DemolishHourglassTimerHUD
           ===================================================================== */}
        <section id="t5a-2-respawn-hourglass"
          className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
          <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" isLight={isLight}>
                T5A.2
              </Badge>
              <h2 className="text-base font-bold font-mono flex items-center gap-1.5">
                <Hourglass className="h-4 w-4 text-amber-500" />
                <span>DemolishHourglassTimerHUD (`src/hud/DemolishHourglassTimerHUD.tsx`)</span>
              </h2>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeRespawnTimer · 3-Stage Color Progression
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => setRespawnAutoLoop((v) => !v)}
              className="px-2.5 py-1 rounded-lg border border-neutral-400/40 text-xs font-mono cursor-pointer hover:bg-neutral-500/10"
            >
              <RotateCcw className="h-3 w-3 inline mr-1" />
              {respawnAutoLoop ? '切换手动滑块定位' : '恢复 3.0s 循环倒计时'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${subPanelClass}`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="opacity-75">当前倒计时阶段:</span>
                <span ref={respawnReadoutRef} className="font-bold text-amber-500 tabular-nums">
                  {respawnRemSec.toFixed(2)}s / 3.00s
                </span>
              </div>
              <SliderControl label="Remaining Respawn Seconds (3.0s → 0.0s)" value={respawnRemSec} min={0}
                max={3.0} step={0.05} unit="s" isLight={isLight} onChange={(v) => { setRespawnAutoLoop(false);
                setRespawnRemSec(v); channelRef.current.setRespawnTimer({ remainingSeconds: v, totalSeconds: 3.0,
                active: true, }); }} />
            </div>

            <div
              className={`h-[124px] rounded-2xl border flex flex-col items-center justify-center gap-2 ${previewStageClass}`}
            >
              <DemolishHourglassTimerHUD
                isLight={isLight}
                subscribeRespawnTimer={channelRef.current.subscribeRespawnTimer}
                remainingSeconds={respawnRemSec}
                totalSeconds={3.0}
                alwaysVisible={true}
                width={260}
                height={38}
              />
              <span className="text-[10px] font-mono opacity-65">
                左右进度条向中心沙漏同步收敛 (`transform-origin: 100% 50%` & `0% 50%`)
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            T5A.3: PitchMiniMapHUD
           ===================================================================== */}
        <section id="t5a-3-pitch-minimap"
          className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
          <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" isLight={isLight}>
                T5A.3
              </Badge>
              <h2 className="text-base font-bold font-mono flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-500" />
                <span>PitchMiniMapHUD (`src/hud/PitchMiniMapHUD.tsx`)</span>
              </h2>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeMiniMap · 34 Boost Pads · 180° Perspective Flip
              </Badge>
            </div>
            <Button
              variant={miniMapFlipped ? 'primary' : 'secondary'}
              size="sm"
              isLight={isLight}
              onClick={() => {
                const next = !miniMapFlipped;
                setMiniMapFlipped(next);
                channelRef.current.setMiniMap({ isFlipped: next });
              }}
            >
              视角翻转: {miniMapFlipped ? 'Orange 视角 (180° Flipped)' : 'Blue 视角 (0° Normal)'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${subPanelClass}`}>
              <SliderControl label="Ball Hit Speed Ring (HSL 60° Yellow → 0° Red)" value={ballHitKph} min={0}
                max={180} step={1} unit=" KPH" isLight={isLight} onChange={(v) => { setAutoStream120Hz(false);
                setBallHitKph(v); channelRef.current.setMiniMap({ ballHitKph: v }); }} />
              <div className="grid grid-cols-2 gap-3">
                <SliderControl label="Ball X (%)" value={ballX} min={10} max={90} step={1} unit="%"
                  isLight={isLight} onChange={(v) => { setAutoStream120Hz(false); setBallX(v);
                  channelRef.current.setMiniMap({ ballX: v }); }} />
                <SliderControl label="Ball Y (%)" value={ballY} min={10} max={90} step={1} unit="%"
                  isLight={isLight} onChange={(v) => { setAutoStream120Hz(false); setBallY(v);
                  channelRef.current.setMiniMap({ ballY: v }); }} />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-center ${previewStageClass}`}>
              <PitchMiniMapHUD
                isLight={isLight}
                ballX={ballX}
                ballY={ballY}
                ballHitKph={ballHitKph}
                isFlipped={miniMapFlipped}
                subscribeMiniMap={channelRef.current.subscribeMiniMap}
              />
            </div>
          </div>
        </section>

        {/* =====================================================================
            T5A.4 & T5A.5: DualLayerBoostPieHUD & DigitSlotReelHUD
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* T5A.4: DualLayerBoostPieHUD */}
          <section id="t5a-4-boost-pie"
            className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  T5A.4
                </Badge>
                <h2 className="text-base font-bold font-mono flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-emerald-500" />
                  <span>DualLayerBoostPieHUD (每 12 一档 · 9 段七色+红闪)</span>
                </h2>
              </div>
              <span ref={boostReadoutRef} className="text-xs font-mono font-bold text-emerald-500 tabular-nums">
                {boostVal}%
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 ${subPanelClass}`}>
              <SliderControl label="Boost Amount (拖动快速下调可观察 Ghost Sector 残影追赶)" value={boostVal} min={0} max={100}
                step={1} unit="%" isLight={isLight} onChange={(v) => { setAutoStream120Hz(false); setBoostVal(v);
                channelRef.current.setBoost(v, false); }} />
              <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                <span className="opacity-70 mr-1">每12一档:</span>
                {STEP_12_TIER_PRESETS.map((tier) => (
                  <button
                    key={tier.range}
                    type="button"
                    onClick={() => {
                      setAutoStream120Hz(false);
                      setBoostVal(tier.val);
                      channelRef.current.setBoost(tier.val, false);
                    }}
                    className="px-1.5 py-0.5 rounded border cursor-pointer font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${tier.hex}22`,
                      borderColor: `${tier.hex}88`,
                      color: isLight ? '#0f172a' : '#f8fafc',
                    }}
                    title={`${tier.range}: ${tier.label}`}
                  >
                    {tier.range} {tier.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className={`h-[170px] rounded-2xl border flex items-center justify-center ${previewStageClass}`}>
              <DualLayerBoostPieHUD
                isLight={isLight}
                boostAmount={boostVal}
                subscribeBoost={channelRef.current.subscribeBoost}
                size={132}
                colorScheme="step-12"
              />
            </div>
          </section>

          {/* T5A.5: DigitSlotReelHUD */}
          <section id="t5a-5-digit-slot-reel"
            className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  T5A.5
                </Badge>
                <h2 className="text-base font-bold font-mono flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-amber-500" />
                  <span>DigitSlotReelHUD</span>
                </h2>
              </div>
              <Badge variant="primary" size="sm" isLight={isLight}>
                0-Reflow translate3d Reel
              </Badge>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between flex-wrap gap-2 ${subPanelClass}`}>
              <span className="text-xs font-mono opacity-80">快速预设跳变测试:</span>
              <div className="flex items-center gap-1.5">
                {[0, 12, 33, 54, 78, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAutoStream120Hz(false);
                      setBoostVal(preset);
                      channelRef.current.setBoost(preset, false);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className={`h-[170px] rounded-2xl border flex items-center justify-center ${previewStageClass}`}>
              <DigitSlotReelHUD
                isLight={isLight}
                value={boostVal}
                subscribeBoost={channelRef.current.subscribeBoost}
              />
            </div>
          </section>
        </div>

        {/* =====================================================================
            T5A.6: KickoffCountdownFlashHUD
           ===================================================================== */}
        <section id="t5a-6-countdown-flash"
          className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${cardClass}`}>
          <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" isLight={isLight}>
                T5A.6
              </Badge>
              <h2 className="text-base font-bold font-mono flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>KickoffCountdownFlashHUD (`src/hud/KickoffCountdownFlashHUD.tsx`)</span>
              </h2>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeCountdownFlash · Web Animations API GPU Scale-Pop
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${subPanelClass}`}>
              <span className="text-xs font-mono opacity-80">
                点击触发 `subscribeCountdownFlash` 瞬态缩放闪字 (`4 → 3 → 2 → 1 → GO!`):
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {([4, 3, 2, 1, 0, null] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => {
                      setCountdownVal(val);
                      channelRef.current.setCountdownFlash({ value: val });
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border cursor-pointer transition-all ${
                      countdownVal === val
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    {val === null ? 'Hidden' : val === 0 ? '0 (GO!)' : String(val)}
                  </button>
                ))}
              </div>
            </div>

            <div className={`h-[148px] rounded-2xl border flex items-center justify-center ${previewStageClass}`}>
              <KickoffCountdownFlashHUD
                isLight={isLight}
                value={countdownVal}
                subscribeCountdownFlash={channelRef.current.subscribeCountdownFlash}
              />
            </div>
          </div>
        </section>
      </div>
  );
};
