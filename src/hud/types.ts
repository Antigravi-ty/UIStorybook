import React from 'react';

export type HudThemeStyle = 'glass' | 'tactile' | 'minimal';

export interface MatchScoreState {
  blueScore: number;
  orangeScore: number;
  timeRemainingSec: number;
  isOvertime?: boolean;
  gameMode?: string;
  blueTeamName?: string;
  orangeTeamName?: string;
}

export interface BoostState {
  amount: number; // 0 to 100
  isInfinite?: boolean;
  isFiring?: boolean;
}

export interface BallCamState {
  isBallCam: boolean;
  ballAngleDeg?: number; // 0-360 deg relative to car heading, for off-screen locator arrow
  distanceToBallMeters?: number;
}

export interface SpeedState {
  speed: number; // 0 to 2300 Unreal Units / s
  maxSpeed?: number;
  unit?: 'uu/s' | 'km/h' | 'mph';
  isSupersonic?: boolean;
}

export type FlipStatus = 'grounded' | 'timer' | 'expired' | 'reset-ready';

export interface FlipTimerState {
  status: FlipStatus;
  timerRemainingSec: number; // e.g. 1.5s counting down to 0
  maxTimerSec: number; // default 1.5s
  wheelContacts: [boolean, boolean, boolean, boolean]; // FL, FR, RL, RR
}

export type AccoladeType = 'goal' | 'save' | 'epic-save' | 'demo' | 'shot' | 'aerial' | 'assist';

export interface AccoladeEvent {
  id: string;
  type: AccoladeType;
  title: string;
  subtitle?: string;
  player?: string;
  team?: 'blue' | 'orange';
  speedKmh?: number;
  timestamp: number;
}

export interface QuickChatMessage {
  id: string;
  sender: string;
  team: 'blue' | 'orange';
  text: string;
  timestamp: number;
}

export interface NetworkTelemetry {
  pingMs: number;
  fps: number;
  subTickJitterMs: number;
  packetLossPct: number;
}
