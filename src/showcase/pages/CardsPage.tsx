import React, { useState } from 'react';
import { Square, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, SelectableCard } from '../../layout/Card';
import { GridStack } from '../../layout/GridStack';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { CodeBlock } from '../CodeBlock';

export const CardsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const [selectedCar, setSelectedCar] = useState('fennec');

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Card 卡片与选择器</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          用于信息块包裹、指标展示及车辆预设选取的卡片容器。内置选框环（ring-2）、微距按压缩放（scale-98）。
        </p>
      </div>

      {/* 1. Standard Cards */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <span className="font-bold text-sm">1. 标准结构卡片 (Card)</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card isLight={isLight}>
            <CardHeader
              title="Physics Engine Status"
              subtitle="RocketSim WebAssembly Kernel"
              badge={<Badge variant="success" size="sm" dot isLight={isLight}>ONLINE</Badge>}
              isLight={isLight}
            />
            <CardBody>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                120Hz sub-tick physics step loop active. Car-to-ball collisions calculated via SIMD-accelerated WASM bytecode.
              </p>
            </CardBody>
            <CardFooter isLight={isLight}>
              <span>Sub-tick Latency: 0.42ms</span>
              <Button size="sm" variant="ghost" isLight={isLight}>Inspect</Button>
            </CardFooter>
          </Card>

          <Card isLight={isLight} interactive>
            <CardHeader
              title="Interactive Card (Clickable)"
              subtitle="Hover & active tactile motion"
              action={<ExternalLink className="h-4 w-4 text-neutral-400" />}
              isLight={isLight}
            />
            <CardBody>
              <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                悬停触发边框微亮，支持平滑手势反馈与焦点环辅助。
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 2. Selectable Cards */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <span className="font-bold text-sm">2. 车辆与道具选择卡片 (SelectableCard)</span>
        <GridStack cols={2} gap="md">
          <SelectableCard
            id="octane"
            title="Octane Standard"
            subtitle="Standard balanced hitbox"
            selected={selectedCar === 'octane'}
            onSelect={setSelectedCar}
            isLight={isLight}
            badge={<Badge size="sm" isLight={isLight}>Classic</Badge>}
            tags={['All-Round', 'Ranked 1#']}
            preview={<span className="text-3xl">🏎️</span>}
          />

          <SelectableCard
            id="fennec"
            title="Fennec MK-II"
            subtitle="High visual hit accuracy"
            selected={selectedCar === 'fennec'}
            onSelect={setSelectedCar}
            isLight={isLight}
            badge={<Badge size="sm" variant="primary" isLight={isLight}>Pro Choice</Badge>}
            tags={['Boxy Hitbox', 'Meta']}
            preview={<span className="text-3xl">🚗</span>}
          />
        </GridStack>
        <p className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          当前选定车辆 ID: <span className="text-amber-500 font-bold">{selectedCar}</span>
        </p>
      </div>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent 代码配方 (Card Recipe)"
        code={`import { Card, CardHeader, CardBody, CardFooter, SelectableCard } from '@/components/layout';

// 1. 标准信息卡片
<Card isLight={isLight}>
  <CardHeader title="Server Metrics" badge={<Badge variant="success">OK</Badge>} />
  <CardBody>Content details here</CardBody>
</Card>

// 2. 选择性交互卡片 (Garage 车库)
<SelectableCard
  id="fennec"
  title="Fennec MK-II"
  subtitle="Boxy Hitbox"
  selected={activeId === 'fennec'}
  onSelect={handleSelect}
  isLight={isLight}
  tags={['Pro Pick']}
/>`}
      />
    </div>
  );
};
