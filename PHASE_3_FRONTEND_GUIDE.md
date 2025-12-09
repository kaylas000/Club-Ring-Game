# 🎯 PHASE 3: FRONTEND INTEGRATION - IMPLEMENTATION GUIDE

**Status**: Ready to Implement  
**Estimated Time**: 2-3 hours  
**Target Date**: December 10-12, 2025

---

## 📊 FRONTEND ARCHITECTURE

```
frontend/
├── src/
│   ├── services/
│   │   └── matchService.ts           (NEW) WebSocket client
│   ├── components/
│   │   ├── BattleScreen.tsx          (NEW) Battle UI
│   │   ├── ResultsScreen.tsx         (NEW) Results UI
│   │   ├── LeaderboardScreen.tsx     (NEW) Leaderboard UI
│   │   └── PlayerProfile.tsx         (NEW) Player stats
│   ├── hooks/
│   │   ├── useMatch.ts               (NEW) Match logic
│   │   └── usePlayer.ts              (NEW) Player logic
│   └── pages/
│       ├── Battle.tsx                (NEW)
│       └── Leaderboard.tsx           (NEW)
├── package.json
└── tsconfig.json
```

---

## 🔧 STEP 1: WebSocket Client Setup (30 min)

### Install Dependencies

```bash
cd frontend
npm install socket.io-client
npm install --save-dev @types/socket.io-client
```

### Create Match Service

**File**: `frontend/src/services/matchService.ts`

```typescript
import { io, Socket } from 'socket.io-client';

interface MatchState {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Health: number;
  player2Health: number;
  player1Stamina: number;
  player2Stamina: number;
  player1DamageDealt: number;
  player2DamageDealt: number;
  currentRound: number;
  maxRounds: number;
}

export class MatchService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connected = false;

  async connect(token: string, serverUrl: string = 'http://localhost:3000'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.connected = true;
        this.emit('connected', { timestamp: Date.now() });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.warn('Disconnected from server');
        this.connected = false;
        this.emit('disconnected', { timestamp: Date.now() });
      });

      // WebSocket event listeners
      this.socket.on('match_start', (data) => this.emit('match_start', data));
      this.socket.on('player_action', (data) => this.emit('player_action', data));
      this.socket.on('round_end', (data) => this.emit('round_end', data));
      this.socket.on('match_end', (data) => this.emit('match_end', data));
      this.socket.on('match_state', (data) => this.emit('match_state', data));
      this.socket.on('match_cancelled', (data) => this.emit('match_cancelled', data));
      this.socket.on('error', (error) => this.emit('error', error));
    });
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected || false;
  }

  startMatch(player1Id: string, player2Id: string): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }
    this.socket.emit('start_match', { player1Id, player2Id });
  }

  sendAction(matchId: string, action: string, targetPlayer?: string): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }
    this.socket.emit('player_action', { matchId, action, targetPlayer });
  }

  completeMatch(
    matchId: string,
    winnerId: string,
    player1Score: number,
    player2Score: number,
    duration: number,
  ): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }
    this.socket.emit('complete_match', {
      matchId,
      winnerId,
      player1Score,
      player2Score,
      duration,
    });
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.connected = false;
  }
}

// Export singleton instance
export const matchService = new MatchService();
```

---

## 🔧 STEP 2: React Hooks (30 min)

### Custom Hook for Match

**File**: `frontend/src/hooks/useMatch.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/matchService';

interface MatchState {
  matchId: string;
  player1Health: number;
  player2Health: number;
  player1Stamina: number;
  player2Stamina: number;
  player1DamageDealt: number;
  player2DamageDealt: number;
  currentRound: number;
  maxRounds: number;
}

export function useMatch(player1Id: string, player2Id: string) {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    // Connect to server
    const token = localStorage.getItem('token') || '';
    matchService.connect(token).then(() => {
      setIsConnected(true);
    }).catch((err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Setup listeners
    const handleMatchStart = (data: any) => {
      setMatchState(data.matchState);
    };

    const handlePlayerAction = (data: any) => {
      setMatchState((prev) => ({
        ...prev!,
        ...data.matchState,
      }));
    };

    const handleRoundEnd = (data: any) => {
      setMatchState((prev) => ({
        ...prev!,
        currentRound: prev!.currentRound + 1,
        ...data.matchState,
      }));
    };

    const handleMatchEnd = (data: any) => {
      setWinner(data.winnerId);
      setMatchState((prev) => ({
        ...prev!,
        ...data.matchState,
      }));
    };

    const handleError = (error: any) => {
      setError(error.message || 'An error occurred');
    };

    matchService.on('match_start', handleMatchStart);
    matchService.on('player_action', handlePlayerAction);
    matchService.on('round_end', handleRoundEnd);
    matchService.on('match_end', handleMatchEnd);
    matchService.on('error', handleError);

    return () => {
      matchService.off('match_start', handleMatchStart);
      matchService.off('player_action', handlePlayerAction);
      matchService.off('round_end', handleRoundEnd);
      matchService.off('match_end', handleMatchEnd);
      matchService.off('error', handleError);
    };
  }, [player1Id, player2Id]);

  const startMatch = useCallback(() => {
    matchService.startMatch(player1Id, player2Id);
  }, [player1Id, player2Id]);

  const sendAction = useCallback((action: string) => {
    if (matchState) {
      matchService.sendAction(matchState.matchId, action);
    }
  }, [matchState]);

  const completeMatch = useCallback((winnerId: string, scores: any) => {
    if (matchState) {
      matchService.completeMatch(
        matchState.matchId,
        winnerId,
        scores.player1Score,
        scores.player2Score,
        scores.duration,
      );
    }
  }, [matchState]);

  return {
    matchState,
    isConnected,
    error,
    winner,
    startMatch,
    sendAction,
    completeMatch,
  };
}
```

---

## 🔧 STEP 3: Battle Screen Component (1 hour)

**File**: `frontend/src/components/BattleScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useMatch } from '../hooks/useMatch';
import './BattleScreen.css';

interface BattleScreenProps {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  onMatchEnd: (winner: string, scores: any) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  player1Id,
  player1Name,
  player2Id,
  player2Name,
  onMatchEnd,
}) => {
  const { matchState, isConnected, error, winner, startMatch, sendAction } = useMatch(
    player1Id,
    player2Id,
  );
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Start match on component mount
  useEffect(() => {
    if (isConnected && !matchState) {
      startMatch();
    }
  }, [isConnected, matchState, startMatch]);

  // Timer countdown
  useEffect(() => {
    if (!matchState || winner) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [matchState, winner]);

  // Handle match end
  useEffect(() => {
    if (winner) {
      onMatchEnd(winner, {
        player1Score: matchState?.player1DamageDealt || 0,
        player2Score: matchState?.player2DamageDealt || 0,
        duration: 180 - timeLeft,
      });
    }
  }, [winner, matchState, timeLeft, onMatchEnd]);

  const handleAction = (action: string) => {
    setSelectedAction(action);
    sendAction(action);
  };

  if (error) {
    return <div className="battle-error">Error: {error}</div>;
  }

  if (!isConnected || !matchState) {
    return <div className="battle-loading">Loading match...</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="battle-screen">
      <div className="battle-header">
        <h2>Round {matchState.currentRound} of {matchState.maxRounds}</h2>
        <div className="timer">{formatTime(timeLeft)}</div>
      </div>

      <div className="battle-arena">
        {/* Player 1 */}
        <div className="player player-1">
          <div className="player-name">{player1Name}</div>
          <div className="health-container">
            <div className="health-bar">
              <div
                className="health-fill"
                style={{ width: `${Math.max(0, matchState.player1Health)}%` }}
              />
            </div>
            <span className="health-value">HP: {Math.max(0, matchState.player1Health)}</span>
          </div>
          <div className="stamina-container">
            <div className="stamina-bar">
              <div
                className="stamina-fill"
                style={{ width: `${Math.max(0, matchState.player1Stamina)}%` }}
              />
            </div>
            <span className="stamina-value">Stamina: {Math.max(0, matchState.player1Stamina)}</span>
          </div>
          <div className="damage">DMG: {matchState.player1DamageDealt}</div>
        </div>

        {/* VS */}
        <div className="vs-divider">VS</div>

        {/* Player 2 */}
        <div className="player player-2">
          <div className="player-name">{player2Name}</div>
          <div className="health-container">
            <div className="health-bar">
              <div
                className="health-fill"
                style={{ width: `${Math.max(0, matchState.player2Health)}%` }}
              />
            </div>
            <span className="health-value">HP: {Math.max(0, matchState.player2Health)}</span>
          </div>
          <div className="stamina-container">
            <div className="stamina-bar">
              <div
                className="stamina-fill"
                style={{ width: `${Math.max(0, matchState.player2Stamina)}%` }}
              />
            </div>
            <span className="stamina-value">Stamina: {Math.max(0, matchState.player2Stamina)}</span>
          </div>
          <div className="damage">DMG: {matchState.player2DamageDealt}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {['JAB', 'CROSS', 'HOOK', 'UPPERCUT', 'GUARD', 'SLIP'].map((action) => (
          <button
            key={action}
            className={`action-btn ${selectedAction === action ? 'active' : ''}`}
            onClick={() => handleAction(action)}
            disabled={matchState.player1Stamina < 10}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**File**: `frontend/src/components/BattleScreen.css`

```css
.battle-screen {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.timer {
  font-size: 32px;
  color: #00ff00;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.battle-arena {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  margin-bottom: 30px;
  min-height: 300px;
  align-items: center;
}

.player {
  border: 2px solid #0f3460;
  border-radius: 10px;
  padding: 20px;
  background: rgba(15, 52, 96, 0.3);
}

.player-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #00d4ff;
}

.health-container,
.stamina-container {
  margin-bottom: 15px;
}

.health-bar,
.stamina-bar {
  width: 100%;
  height: 20px;
  background: #333;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #ffff00);
  transition: width 0.3s ease;
}

.stamina-fill {
  height: 100%;
  background: linear-gradient(90deg, #0099ff, #00ffff);
  transition: width 0.3s ease;
}

.health-value,
.stamina-value {
  font-size: 12px;
  color: #aaa;
}

.damage {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
  margin-top: 10px;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #ff6b6b;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 15px;
  background: #0f3460;
  color: #00d4ff;
  border: 2px solid #00d4ff;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover:not(:disabled) {
  background: #00d4ff;
  color: #0f3460;
  transform: scale(1.05);
}

.action-btn.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.battle-loading {
  text-align: center;
  padding: 50px;
  color: white;
  font-size: 18px;
}

.battle-error {
  text-align: center;
  padding: 50px;
  color: #ff6b6b;
  font-size: 18px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 10px;
  border: 2px solid #ff6b6b;
}
```

---

## 🔧 STEP 4: Results Screen (30 min)

**File**: `frontend/src/components/ResultsScreen.tsx`

```typescript
import React from 'react';
import './ResultsScreen.css';

interface ResultsScreenProps {
  winner: string | null;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  player1Reward: number;
  player2Reward: number;
  onBack: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  winner,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  player1Reward,
  player2Reward,
  onBack,
}) => {
  const isDraw = winner === 'DRAW';
  const player1Won = winner === 'player1';

  return (
    <div className="results-screen">
      <div className="results-container">
        <h1 className="results-title">
          {isDraw ? "It's a Draw!" : `${player1Won ? player1Name : player2Name} Wins!`}
        </h1>

        <div className="score-display">
          <div className={`player-result ${player1Won && !isDraw ? 'winner' : ''}`}>
            <h2>{player1Name}</h2>
            <div className="score">{player1Score}</div>
            <div className="reward">+{player1Reward} RING</div>
          </div>

          <div className="vs">VS</div>

          <div className={`player-result ${!player1Won && !isDraw ? 'winner' : ''}`}>
            <h2>{player2Name}</h2>
            <div className="score">{player2Score}</div>
            <div className="reward">+{player2Reward} RING</div>
          </div>
        </div>

        <button className="back-btn" onClick={onBack}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
};
```

**File**: `frontend/src/components/ResultsScreen.css`

```css
.results-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.results-container {
  text-align: center;
  background: rgba(15, 52, 96, 0.5);
  padding: 40px;
  border-radius: 15px;
  border: 2px solid #00d4ff;
}

.results-title {
  font-size: 48px;
  margin-bottom: 40px;
  color: #ff6b6b;
}

.score-display {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  margin-bottom: 40px;
  align-items: center;
}

.player-result {
  background: rgba(0, 212, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #00d4ff;
}

.player-result.winner {
  background: rgba(255, 255, 0, 0.1);
  border-color: #ffff00;
}

.player-result h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

.score {
  font-size: 64px;
  font-weight: bold;
  color: #00ff00;
  margin-bottom: 10px;
}

.reward {
  font-size: 20px;
  color: #ffff00;
  font-weight: bold;
}

.vs {
  font-size: 36px;
  color: #ff6b6b;
}

.back-btn {
  padding: 15px 40px;
  background: #00d4ff;
  color: #1a1a2e;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #00ffff;
  transform: scale(1.05);
}
```

---

## 🛠️ VERIFICATION CHECKLIST

- [ ] WebSocket client created
- [ ] React hooks implemented
- [ ] BattleScreen component built
- [ ] ResultsScreen component built
- [ ] CSS styling complete
- [ ] WebSocket connects successfully
- [ ] Real-time updates working
- [ ] Actions send correctly
- [ ] Results display properly
- [ ] No console errors
- [ ] Responsive design tested

---

## 🌟 NEXT STEPS

1. Implement Leaderboard component
2. Implement Player Profile component
3. Add authentication UI
4. Integrate with existing frontend
5. E2E testing
6. Performance optimization

---

**Status**: Ready for implementation  
**Time to Complete**: 2-3 hours  
**Difficulty**: Medium

