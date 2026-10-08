import React from 'react';

export type MatchTeam = 'blue' | 'orange';

export interface MatchScoreState {
  blueScore: number;
  orangeScore: number;
  blueName?: string;
  orangeName?: string;
  clockSeconds: number;
  isOvertime: boolean;
  periodLabel?: string;
  countdown?: number | null;
}

export interface BoostState {
  amount: number;
  isSpending: boolean;
  isUnlimited: boolean;
}

export interface SpeedState {
  speedUu: number;
  isSupersonic: boolean;
}

export type FlipTimerPhase = 'grounded' | 'airborne' | 'expired' | 'reset';

export interface FlipTimerState {
  phase: FlipTimerPhase;
  remainingMs: number;
  maxMs: number;
  resetCount?: number;
}

export type CameraMode = 'ball' | 'car';

export type AccoladeType = 'goal' | 'save' | 'epic-save' | 'shot' | 'demo' | 'clear' | 'kickoff';

export interface AccoladeEvent {
  id: string;
  type: AccoladeType;
  title: string;
  subtitle?: string;
  points?: number;
  team?: MatchTeam;
  speedKmh?: number;
}

export interface QuickChatMessage {
  id: string;
  sender: string;
  text: string;
  team: MatchTeam;
  timestamp: number;
}
