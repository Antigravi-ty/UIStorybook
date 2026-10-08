import React from 'react';
import { CodeBlock } from '../CodeBlock';
import { Layer1MainMenuRecipe } from '../../recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../recipes/Layer2PlayRecipe';
import { Layer2SettingsRecipe } from '../../recipes/Layer2SettingsRecipe';
import { Layer2GarageRecipe } from '../../recipes/Layer2GarageRecipe';
import { KeybindingRecipe } from '../../recipes/KeybindingRecipe';
import { MatchHudRecipe } from '../../hud';

export const RecipesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agent 复制参考菜谱</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          即拷即用的全功能业务面板模板。AI Agent 在为 RLCleanWASM 或其它模块开发新界面时，可直接套用对应菜谱。
        </p>
      </div>

      {/* Recipe 1: Layer 1 Root MENU */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h2 className="text-base font-bold">Layer 1 根暂停菜单菜谱 (MENU / 420px)</h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer1MainMenuRecipe isLight={isLight} />
        </div>
        <CodeBlock
          isLight={isLight}
          title="Layer1MainMenuRecipe.tsx"
          code={`import React from 'react';
import { Play, Gamepad2, Wrench, Settings } from 'lucide-react';
import { PanelContainer, PanelContent } from '@/components/layout';
import { MenuContainer, MenuItem, MenuDivider } from '@/components/navigation';

export const MainMenuPanel = ({ isLight, onResume, onPlay, onGarage, onSettings }) => (
  <PanelContainer isLight={isLight} className="w-full max-w-[420px]">
    <div className="px-6 py-5 border-b text-center">
      <h1 className="text-xl font-black tracking-widest uppercase">MENU</h1>
    </div>
    <PanelContent scrollable={false} className="p-5">
      <MenuContainer>
        <MenuItem icon={<Play />} title="Resume Match" shortcut="ESC" variant="primary" onClick={onResume} isLight={isLight} />
        <MenuDivider isLight={isLight} />
        <MenuItem icon={<Gamepad2 />} title="Play" hasArrow onClick={onPlay} isLight={isLight} />
        <MenuItem icon={<Wrench />} title="Garage" hasArrow onClick={onGarage} isLight={isLight} />
        <MenuItem icon={<Settings />} title="Settings" hasArrow onClick={onSettings} isLight={isLight} />
      </MenuContainer>
    </PanelContent>
    <div className="px-5 py-3.5 border-t flex items-center justify-between">
      <span>Background render paused</span>
      <button onClick={() => onSettings('video')}>Click to change settings ↗</button>
    </div>
  </PanelContainer>
);`}
        />
      </div>

      {/* Recipe 2: Layer 2 Play Modes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2 className="text-base font-bold">Layer 2 游戏模式选择面板菜谱 (Play / 680px)</h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2PlayRecipe isLight={isLight} />
        </div>
      </div>

      {/* Recipe 3: Layer 2 Garage */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h2 className="text-base font-bold">Layer 2 车辆预设与外观配置菜谱 (Garage / 680px)</h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2GarageRecipe isLight={isLight} />
        </div>
      </div>

      {/* Recipe 4: Layer 2 Settings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <h2 className="text-base font-bold">Layer 2 综合系统设置面板菜谱 (Settings / 680px)</h2>
        </div>
        <div
          className={`flex justify-center p-6 rounded-2xl border transition-colors ${
            isLight ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs' : 'border-neutral-800 bg-neutral-950/60'
          }`}
        >
          <Layer2SettingsRecipe isLight={isLight} />
        </div>
      </div>

      {/* Recipe 5: In-Game Match HUD */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
            5
          </span>
          <h2 className="text-base font-bold">HUD Layer 对局平视显示层全景配方 (Match HUD / 18:9)</h2>
        </div>
        <div
          className="relative w-full aspect-[18/9] rounded-2xl overflow-hidden border border-neutral-700 shadow-xl"
          style={{
            background: 'radial-gradient(ellipse at 50% 120%, #1a365d 0%, #0f172a 60%, #020617 100%)',
          }}
        >
          <MatchHudRecipe
            scoreState={{ blueScore: 3, orangeScore: 1, clockSeconds: 180, isOvertime: false }}
            boostState={{ amount: 75, isSpending: false, isUnlimited: false }}
            speedState={{ speedUu: 1450, isSupersonic: false }}
            flipState={{ phase: 'grounded', remainingMs: 1250, maxMs: 1250 }}
            cameraMode="ball"
          />
        </div>
      </div>
    </div>
  );
};
