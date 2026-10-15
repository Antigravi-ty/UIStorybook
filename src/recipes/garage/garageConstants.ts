// 1. Car Tab: 8 vehicles with name & hitbox badge (clean 4x2 grid, fits without scrolling)
export interface CarDef {
  id: string;
  name: string;
  hitbox: 'Octane' | 'Dominus' | 'Breakout' | 'Plank' | 'Hybrid' | 'Merc';
}

export const CARS: CarDef[] = [
  { id: 'octane', name: 'Octane', hitbox: 'Octane' },
  { id: 'fennec', name: 'Fennec', hitbox: 'Octane' },
  { id: 'dominus', name: 'Dominus', hitbox: 'Dominus' },
  { id: 'breakout', name: 'Breakout', hitbox: 'Breakout' },
  { id: 'batmobile', name: 'Plank GT', hitbox: 'Plank' },
  { id: 'skyline', name: 'Skyline RS', hitbox: 'Hybrid' },
  { id: 'dingo', name: 'Dingo', hitbox: 'Octane' },
  { id: 'merc', name: 'Merc Titan', hitbox: 'Merc' },
];

// 2. Colour Tab: Blue and Orange team colour fallback preference order (6 presets each)
export interface TeamColourDef {
  id: string;
  name: string;
  hex: string;
  borderClass: string;
}

export const BLUE_TEAM_COLOURS: TeamColourDef[] = [
  { id: 'cobalt', name: 'Cobalt Blue', hex: '#1d4ed8', borderClass: 'border-blue-600' },
  { id: 'sky', name: 'Sky Cyan', hex: '#0284c7', borderClass: 'border-sky-600' },
  { id: 'navy', name: 'Deep Navy', hex: '#1e1b4b', borderClass: 'border-indigo-900' },
  { id: 'teal', name: 'Teal Turquoise', hex: '#0f766e', borderClass: 'border-teal-700' },
  { id: 'purple', name: 'Royal Violet', hex: '#6b21a8', borderClass: 'border-purple-800' },
  { id: 'slate', name: 'Midnight Slate', hex: '#334155', borderClass: 'border-slate-700' },
];

export const ORANGE_TEAM_COLOURS: TeamColourDef[] = [
  { id: 'flame', name: 'Flame Orange', hex: '#ea580c', borderClass: 'border-orange-600' },
  { id: 'crimson', name: 'Crimson Red', hex: '#dc2626', borderClass: 'border-red-600' },
  { id: 'amber', name: 'Sunburst Amber', hex: '#d97706', borderClass: 'border-amber-600' },
  { id: 'ruby', name: 'Ruby Wine', hex: '#9f1239', borderClass: 'border-rose-800' },
  { id: 'gold', name: 'Metallic Gold', hex: '#ca8a04', borderClass: 'border-yellow-600' },
  { id: 'coral', name: 'Sunset Coral', hex: '#f43f5e', borderClass: 'border-rose-500' },
];

// 3. Player Anthem Tab: Music presets + Random option
export interface AnthemDef {
  id: string;
  title: string;
  artist: string;
  duration: string;
  tag: string;
}

export const ANTHEMS: AnthemDef[] = [
  { id: 'random', title: 'Shuffle / Random Anthem', artist: 'All Soundtracks', duration: 'VARIES', tag: 'Random' },
  { id: 'solar-wind', title: 'Solar Eruption (VIP)', artist: 'Tokyo Machine', duration: '0:15', tag: 'High BPM' },
  { id: 'champion-rush', title: 'Champion Arena Rush', artist: 'Koven', duration: '0:14', tag: 'Orchestral' },
  { id: 'neon-overdrive', title: 'Neon Overdrive', artist: 'Pegboard Nerds', duration: '0:16', tag: 'Synthwave' },
  { id: 'sub-bass-fury', title: 'Sub-Bass Drop', artist: 'Noisestorm', duration: '0:12', tag: 'Bass Heavy' },
  { id: 'cyber-victory', title: 'Victory Circuit', artist: 'Protostar', duration: '0:15', tag: 'Electronic' },
];
