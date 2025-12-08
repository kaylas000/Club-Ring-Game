// Network and WebSocket Types

import type { CombatAction, FighterStats } from './combat';
import type { MatchConfig } from './game';

export type SocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'match:found'
  | 'match:start'
  | 'match:action'
  | 'match:round_end'
  | 'match:end'
  | 'player:update'
  | 'error';

export interface SocketMessage<T = any> {
  event: SocketEvent;
  data: T;
  timestamp: number;
}

export interface MatchFoundPayload {
  matchId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar?: string;
  opponentStats: FighterStats;
  config: MatchConfig;
}

export interface MatchActionPayload {
  matchId: string;
  playerId: string;
  action: CombatAction;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthData {
  telegramInitData: string;
  timestamp: number;
}

export interface MatchmakingRequest {
  playerId: string;
  characterId: string;
  config: MatchConfig;
}
