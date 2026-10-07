import React, { useState, useEffect } from 'react';
import { Tag, Gamepad2, Keyboard as KeyboardIcon, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { Badge } from '../../primitives/Badge';
import { KeycapBadge } from '../../primitives/KeycapBadge';
import { Button } from '../../primitives/Button';
import { HStack } from '../../layout/HStack';
import { VStack } from '../../layout/VStack';
import { CodeBlock } from '../CodeBlock';

export const BadgesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Listen to physical keyboard events for interactive tester
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      setActiveKey(e.key.toUpperCase());
    };
    const handleUp = () => {
      setActiveKey(null);
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  const keys = ['ESC', 'TAB', 'W', 'A', 'S', 'D', 'SPACE', 'ENTER', 'SHIFT', 'CTRL', 'F4'];
  const padKeys = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'START'];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Badge & Keycap 徽章与键位</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          状态徽章与快捷键位的标准化原子控件。规范两种形态（圆角矩形 / 胶囊 Capsule）、三种尺寸修饰符（Small / Medium / Large），并彻底移除多余下沉阴影，与灰色背景形成清晰对比。
        </p>
      </div>

      {/* 1. Status Badges & Shapes */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Tag className="h-4 w-4 text-amber-500" />
          <span>1. 状态徽章 (Status Badge) 与形态对比</span>
        </div>

        {/* Shape 1: Rounded Rectangle (Default) */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
            形态 A：圆角矩形 Rounded Rectangle (默认推荐，通用场景)
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default" shape="rounded" isLight={isLight}>DEFAULT</Badge>
            <Badge variant="primary" shape="rounded" isLight={isLight} dot>ACTIVE</Badge>
            <Badge variant="success" shape="rounded" isLight={isLight} dot>ONLINE 120 FPS</Badge>
            <Badge variant="warning" shape="rounded" isLight={isLight} icon={<AlertTriangle className="h-3 w-3" />}>HIGH PING</Badge>
            <Badge variant="danger" shape="rounded" isLight={isLight} dot>DISCONNECTED</Badge>
            <Badge variant="outline" shape="rounded" isLight={isLight}>v2.4.0-WASM</Badge>
          </div>
        </div>

        {/* Shape 2: Capsule / Pill */}
        <div className="flex flex-col gap-2 mt-2">
          <span className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
            形态 B：胶囊形式 Capsule / Pill (用于紧凑指示与计数器)
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default" shape="pill" isLight={isLight}>DEFAULT</Badge>
            <Badge variant="primary" shape="pill" isLight={isLight} dot>ACTIVE</Badge>
            <Badge variant="success" shape="pill" isLight={isLight} dot>READY</Badge>
            <Badge variant="danger" shape="pill" isLight={isLight}>RANK 1</Badge>
            <Badge variant="outline" shape="pill" isLight={isLight}>STAGE 2</Badge>
          </div>
        </div>

        {/* Size Modifiers */}
        <HStack gap="md" align="center" className="mt-2 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800">
          <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>尺寸规格 (Modifiers)：</span>
          <Badge size="sm" variant="primary" isLight={isLight}>Small (sm)</Badge>
          <Badge size="md" variant="primary" isLight={isLight}>Medium (md)</Badge>
          <Badge size="lg" variant="primary" isLight={isLight}>Large (lg)</Badge>
        </HStack>
      </div>

      {/* 2. Keycaps Showcase */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <KeyboardIcon className="h-4 w-4 text-indigo-500" />
          <span>2. 键盘按键徽章 (KeycapBadge - Flat / No Heavy Bottom Shadow)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          摒弃突兀的底部立体下沉大阴影，采用扁平利落的精细边框徽章设计。背景色与灰色底面有清晰对比度，支持敲击实时高亮：
        </p>

        <HStack
          gap="sm"
          wrap
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
          }`}
        >
          {keys.map((k) => (
            <KeycapBadge
              key={k}
              shortcut={k}
              size="md"
              isLight={isLight}
              pressed={activeKey === k}
            />
          ))}
        </HStack>

        <HStack gap="md" align="center" className="mt-1">
          <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>尺寸修饰符：</span>
          <KeycapBadge shortcut="TAB" size="sm" isLight={isLight} />
          <KeycapBadge shortcut="TAB" size="md" isLight={isLight} />
          <KeycapBadge shortcut="TAB" size="lg" isLight={isLight} />
        </HStack>
      </div>

      {/* 3. Gamepad Badges */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Gamepad2 className="h-4 w-4 text-emerald-500" />
          <span>3. 手柄控制器按键徽章 (KeycapBadge - Gamepad)</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          匹配 Xbox / PlayStation 控制器色彩规范，无底部厚阴影，清晰分明：
        </p>

        <HStack
          gap="sm"
          wrap
          className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
          }`}
        >
          {padKeys.map((pk) => (
            <KeycapBadge
              key={pk}
              shortcut={pk}
              kind="gamepad"
              size="md"
              isLight={isLight}
            />
          ))}
        </HStack>
      </div>

      {/* 4. Button with Keycap Integration */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <span className="font-bold text-sm">4. 按钮内部快捷键徽章联动 (Button with Keycap Slot)</span>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          按钮内部自动嵌入扁平 KeycapBadge，告别突兀阴影，视觉层次平滑利落：
        </p>
        <HStack gap="md" wrap>
          <Button variant="primary" shortcut="ESC" isLight={isLight}>
            Resume Game
          </Button>
          <Button variant="secondary" shortcut="ENTER" isLight={isLight}>
            Confirm Selection
          </Button>
          <Button variant="outline" shortcut="TAB" isLight={isLight}>
            Scoreboard
          </Button>
          <Button variant="danger" shortcut="F4" isLight={isLight}>
            Forfeit Match
          </Button>
        </HStack>
      </div>

      {/* Code Snippet for AI Agents */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Badge & Keycap Recipe)"
        code={`import { Badge, KeycapBadge, Button } from '@/components/primitives';

// 1. 状态徽章：圆角矩形（默认）与胶囊形态
<Badge variant="success" dot isLight={isLight}>ONLINE</Badge>
<Badge variant="primary" shape="pill" isLight={isLight}>CAPSULE</Badge>

// 2. 键盘物理按键（无底部阴影，清晰扁平）
<KeycapBadge shortcut="ESC" size="sm" isLight={isLight} />
<KeycapBadge shortcut="SPACE" size="md" isLight={isLight} />

// 3. 手柄控制器按键
<KeycapBadge shortcut="RT" kind="gamepad" size="sm" isLight={isLight} />

// 4. 按钮快捷键槽位集成
<Button variant="primary" shortcut="ESC" isLight={isLight}>
  Resume Match
</Button>`}
      />
    </div>
  );
};
