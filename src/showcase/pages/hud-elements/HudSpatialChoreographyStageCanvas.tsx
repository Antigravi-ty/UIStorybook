import React from 'react';
import { Layers, Zap, Cpu, Target, Activity, Sliders, X } from 'lucide-react';
import {
  createHudTransientChannel,
  EdgeDemoIndicatorConfig,
} from '../../../hud/hudTransientChannel';
import { StepperScoreboardHUD } from '../../../hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../../hud/EdgePlayerHudStrip';
import { BallCameraIndicator } from '../../../hud/BallCameraIndicator';
import { VelocityProgressBar } from '../../../hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../../hud/CircularBoostGauge';
import { CompactTelemetryBarHUD } from '../../../hud/CompactTelemetryBarHUD';
import { FlipIndicatorPillHUD } from '../../../hud/FlipIndicatorPillHUD';
import { TemporalReplayFooterHUD } from '../../../hud/TemporalReplayFooterHUD';
import { DemolishHourglassTimerHUD } from '../../../hud/DemolishHourglassTimerHUD';
import { ArenaBackdrop } from '../../ArenaBackdrop';
import { JumpPlacementOption } from './HudChoreographyControlDeck';
import {
  HudAnchorStage,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
  HudLayoutStrategy,
  HudSlotMode,
} from '../../../layout/HudAnchorStage';

const DIAGNOSTIC_STACK_ITEMS = [
  { id: 'simd', title: 'Kernel Physics SIMD', tag: '120Hz', icon: Cpu },
  { id: 'hitbox', title: 'Octane Hitbox Wireframe', tag: 'AABB', icon: Target },
  { id: 'pacing', title: 'Sub-Tick Frame Pacing', tag: '0.1ms', icon: Activity },
  { id: 'audio', title: 'Engine Audio DSP EQ', tag: '8-Band', icon: Sliders },
] as const;

export interface HudSpatialChoreographyStageCanvasProps {
  hudThemeLight: boolean;
  layoutStrategy: HudLayoutStrategy;
  leftTopBandVisible: boolean;
  rightTopBandVisible: boolean;
  topBandSlotMode: HudSlotMode;
  showTelemetryTopLeft: boolean;
  showStackTopRight: boolean;
  stackTrayOpen: boolean;
  setStackTrayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  leftTeamColor: string;
  leftBarColor: string;
  rightTeamColor: string;
  rightBarColor: string;
  demoIndicatorConfig: EdgeDemoIndicatorConfig;
  handleSelectPov: (slotKey: 1 | 2 | 3 | 4 | 5 | 6 | null) => void;
  selfDemoActive: boolean;
  selfDemoPillTextRef: React.RefObject<HTMLSpanElement | null>;
  showBallCam: boolean;
  isCockpitVisible: boolean;
  instantCockpitTransition: boolean;
  jumpPlacement: JumpPlacementOption;
  handleCycleFlipSimMode: () => void;
  notifSlideOpen: boolean;
  channel: ReturnType<typeof createHudTransientChannel>;
}

export const HudSpatialChoreographyStageCanvas: React.FC<
  HudSpatialChoreographyStageCanvasProps
> = ({
  hudThemeLight,
  layoutStrategy,
  leftTopBandVisible,
  rightTopBandVisible,
  topBandSlotMode,
  showTelemetryTopLeft,
  showStackTopRight,
  stackTrayOpen,
  setStackTrayOpen,
  leftTeamColor,
  leftBarColor,
  rightTeamColor,
  rightBarColor,
  demoIndicatorConfig,
  handleSelectPov,
  selfDemoActive,
  selfDemoPillTextRef,
  showBallCam,
  isCockpitVisible,
  instantCockpitTransition,
  jumpPlacement,
  handleCycleFlipSimMode,
  notifSlideOpen,
  channel,
}) => {
  return (
    <div className="relative w-full h-[540px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl bg-black">
      <ArenaBackdrop
        preset={hudThemeLight ? 'daylight' : 'night'}
        brightness={hudThemeLight ? 75 : 32}
      />

      {/* Pure L2 HUD Anchor Stage Shell */}
      <HudAnchorStage
        strategy={layoutStrategy}
        style={{ fontFamily: 'var(--font-jetbrains)' }}
      >
        {/* 1. TOP-LEFT ZONE:
               - Top Container (`56px` shared vertical space with Top-Right Stack Icon + Bubble)
               - Below (`y = 56px`): My Team `[1, 2, 3]` `EdgePlayerHudStrip` */}
        <HudZone anchor="top-left" flush>
          <HudSlot
            visible={leftTopBandVisible}
            mode={topBandSlotMode}
            reservedHeight={56}
            innerClassName="h-[56px] flex items-center pl-3"
          >
            {showTelemetryTopLeft && (
              <CompactTelemetryBarHUD
                isLight={hudThemeLight}
                subscribeTelemetry={channel.subscribeTelemetry}
              />
            )}
          </HudSlot>

          {/* My Team [1, 2, 3] Strip (Always on Left, colored Blue or Orange via Switch Side) */}
          <div className={!leftTopBandVisible && topBandSlotMode === 'collapse' ? 'pt-2.5' : ''}>
            <EdgePlayerHudStrip
              side="left"
              teamColor={leftTeamColor}
              barColor={leftBarColor}
              isLight={hudThemeLight}
              demoIndicatorConfig={demoIndicatorConfig}
              onSelectSlot={handleSelectPov}
              subscribeRoster={channel.subscribeRoster}
            />
          </div>
        </HudZone>

        {/* 2. TOP-CENTER ZONE (Flush to `top-0`):
               - `5A.1 StepperScoreboardHUD` (Scorebug + Series Pips Banner + Phase Drop-Banner)
               - `T5A.2 DemolishHourglassTimerHUD` flowing naturally 12px below active sub-banners */}
        <HudZone anchor="top-center" flush gap={12} zIndexClassName="z-40">
          <StepperScoreboardHUD
            isLight={hudThemeLight}
            leftTeamColor={leftTeamColor}
            rightTeamColor={rightTeamColor}
            subscribeScoreboard={channel.subscribeScoreboard}
          />

          <HudSlot visible={selfDemoActive} mode="collapse">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`px-3 py-1.5 rounded-xl border ${
                  hudThemeLight
                    ? 'bg-white/95 border-neutral-300 shadow-md'
                    : 'bg-neutral-950/95 border-white/15 shadow-md'
                }`}
              >
                <DemolishHourglassTimerHUD
                  subscribeRespawnTimer={channel.subscribeRespawnTimer}
                  totalSeconds={3.0}
                  alwaysVisible={false}
                  isLight={hudThemeLight}
                  width={210}
                  height={28}
                />
              </div>
              <span
                ref={selfDemoPillTextRef}
                className="text-[10px] tracking-widest uppercase text-red-400 bg-black/85 px-2 py-0.5 rounded font-bold tabular-nums"
              >
                RESPAWN IN 3.0S
              </span>
            </div>
          </HudSlot>
        </HudZone>

        {/* 3. TOP-RIGHT ZONE:
               - Top Container (`56px` shared vertical space with Top-Left Telemetry)
               - Below (`y = 56px`): Opponent Team `[4, 5, 6]` `EdgePlayerHudStrip` */}
        <HudZone anchor="top-right" flush zIndexClassName="z-50">
          <HudSlot
            visible={rightTopBandVisible}
            mode={topBandSlotMode}
            reservedHeight={56}
            innerClassName="h-[56px] flex items-center justify-end pr-3 relative z-50"
          >
            {showStackTopRight && (
              <div className="relative pointer-events-auto">
                {/* 6D Diagnostic Stack 40x40 Icon + Counter Bubble */}
                <button
                  type="button"
                  onClick={() => setStackTrayOpen((v) => !v)}
                  title="6D Diagnostic Floating Window Stack (点击展开/收起调参窗口栈，展开时直接覆盖下方 4-6 区域)"
                  className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${
                    hudThemeLight
                      ? 'bg-white/95 border-neutral-300 text-neutral-900 hover:bg-neutral-100'
                      : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 hover:bg-neutral-800'
                  } ${stackTrayOpen ? 'ring-2 ring-amber-500/70' : ''}`}
                >
                  <Layers className="h-4 w-4 text-amber-500" />
                  {/* Counter Bubble */}
                  <span
                    className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-extrabold flex items-center justify-center border shadow-xs ${
                      hudThemeLight
                        ? 'bg-neutral-900 text-white border-white'
                        : 'bg-amber-500 text-neutral-950 border-neutral-900'
                    }`}
                  >
                    4
                  </span>
                </button>

                {/* Expandable Diagnostic Window Stack Tray (`z-50` overlays Right [4-6] strip when opened) */}
                {stackTrayOpen && (
                  <div
                    className={`absolute top-[46px] right-0 z-50 w-[236px] rounded-xl border p-2 shadow-lg flex flex-col gap-1.5 ${
                      hudThemeLight
                        ? 'bg-white/96 border-neutral-300 text-neutral-900'
                        : 'bg-neutral-950/96 border-neutral-800 text-neutral-100'
                    }`}
                  >
                    <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                        6D · Diagnostic Windows (4)
                      </span>
                      <button
                        type="button"
                        onClick={() => setStackTrayOpen(false)}
                        className="p-0.5 rounded hover:bg-neutral-500/15 cursor-pointer"
                      >
                        <X className="h-3 w-3 opacity-70" />
                      </button>
                    </div>
                    {DIAGNOSTIC_STACK_ITEMS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setStackTrayOpen(false)}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${
                            hudThemeLight
                              ? 'hover:bg-neutral-100 text-neutral-800'
                              : 'hover:bg-neutral-900 text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <IconComp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold shrink-0">
                            {item.tag}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </HudSlot>

          {/* Opponent Team [4, 5, 6] Strip (Hidden in Player Live unless demolished, visible in Replay/Spectator) */}
          <div
            className={`relative z-30 ${
              !rightTopBandVisible && topBandSlotMode === 'collapse' ? 'pt-2.5' : ''
            }`}
          >
            <EdgePlayerHudStrip
              side="right"
              teamColor={rightTeamColor}
              barColor={rightBarColor}
              isLight={hudThemeLight}
              demoIndicatorConfig={demoIndicatorConfig}
              onSelectSlot={handleSelectPov}
              subscribeRoster={channel.subscribeRoster}
            />
          </div>
        </HudZone>

        {/* 4. BOTTOM-LEFT ZONE (Fixed Landmark): `5A.3 BallCameraIndicator` */}
        <HudZone anchor="bottom-left">
          <HudSlot
            visible={showBallCam && isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(-140%, 0, 0)"
            instant={instantCockpitTransition}
          >
            <BallCameraIndicator
              subscribeBallCam={channel.subscribeBallCam}
              shortcut="SPACE"
              label="BALL CAM"
              actionText="TO TOGGLE"
              isLight={hudThemeLight}
              onToggle={() => channel.toggleBallCam()}
            />
          </HudSlot>
        </HudZone>

        {/* 5. BOTTOM-CENTER ZONE (Fixed Landmark):
               `5A.4 VelocityProgressBar` + `5A.7 FlipIndicatorPillHUD` */}
        <HudZone anchor="bottom-center">
          <HudSlot
            visible={isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(0, 220%, 0)"
            instant={instantCockpitTransition}
          >
            <HudRelativeAnchor
              placement={
                jumpPlacement === 'top-left'
                  ? 'top'
                  : jumpPlacement === 'center-bottom-right'
                  ? 'right'
                  : 'left'
              }
              align={jumpPlacement === 'top-left' ? 'start' : 'center'}
              gap={jumpPlacement === 'top-left' ? 8 : 14}
              floating
              attachment={
                <div
                  onClick={handleCycleFlipSimMode}
                  title="点击轮换 Second Flip 状态: 160步倒计时 -> 地面满(1.25s) -> Unlimited(∞) -> No Flip(0)"
                  className="cursor-pointer pointer-events-auto"
                >
                  <FlipIndicatorPillHUD
                    isLight={hudThemeLight}
                    subscribeFlip={channel.subscribeFlip}
                  />
                </div>
              }
            >
              <div className="w-[360px] max-w-[42vw]">
                <VelocityProgressBar
                  subscribeSpeed={channel.subscribeSpeed}
                  width="100%"
                  height={16}
                />
              </div>
            </HudRelativeAnchor>
          </HudSlot>
        </HudZone>

        {/* 6. BOTTOM-RIGHT ZONE:
               `CircularBoostGauge` + `Notification` */}
        <HudZone anchor="bottom-right" flush className="pb-4">
          <div className="mb-3 overflow-hidden pointer-events-auto">
            <div
              className={`flex items-center gap-2.5 pl-3.5 pr-4 py-2 rounded-l-lg border-l border-y shadow-md will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                hudThemeLight
                  ? 'bg-white/96 border-sky-500/60 text-neutral-900'
                  : 'bg-[#09090B]/95 border-sky-500/50 text-white'
              }`}
              style={{
                transform: notifSlideOpen ? 'translate3d(0%, 0, 0)' : 'translate3d(105%, 0, 0)',
              }}
            >
              <Zap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase tracking-widest text-sky-500 font-bold">
                  L3 QUICK NOTIFICATION · ABOVE BOOST SLOT
                </span>
                <span className="text-[11px] opacity-85">
                  锚定于 Boost 表盘固定槽位正上方（Replay 隐藏表盘时高度依然恒定）
                </span>
              </div>
            </div>
          </div>

          <HudSlot
            visible={isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(140%, 0, 0)"
            instant={instantCockpitTransition}
            innerClassName="pr-5"
          >
            <CircularBoostGauge
              subscribeBoost={channel.subscribeBoost}
              isLight={hudThemeLight}
            />
          </HudSlot>
        </HudZone>

        {/* 7. GOAL REPLAY BOTTOM FOOTER (`T5A.1 TemporalReplayFooterHUD`) */}
        <TemporalReplayFooterHUD
          isLight={hudThemeLight}
          subscribeReplayFooter={channel.subscribeReplayFooter}
        />
      </HudAnchorStage>
    </div>
  );
};
