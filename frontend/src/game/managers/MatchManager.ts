import { CombatState, CombatResult } from '@types/combat';
import { GAME_CONFIG } from '../config';

export class MatchManager {
  private combatState: CombatState | null = null;
  private matchResults: CombatResult[] = [];
  private isMatchActive: boolean = false;
  
  initializeMatch(playerStats: any, opponentStats: any): CombatState {
    this.combatState = {
      round: 1,
      maxRounds: GAME_CONFIG.maxRounds,
      player: playerStats,
      opponent: opponentStats,
      comboCount: 0,
      lastAction: null,
      isPlayerTurn: true,
      roundTimeRemaining: GAME_CONFIG.roundDuration,
    };
    
    this.isMatchActive = true;
    return this.combatState;
  }
  
  updateRoundTime(deltaTime: number): void {
    if (!this.combatState) return;
    
    this.combatState.roundTimeRemaining -= deltaTime / 1000;
    
    if (this.combatState.roundTimeRemaining <= 0) {
      this.endRound();
    }
  }
  
  private endRound(): void {
    if (!this.combatState) return;
    
    if (this.combatState.round < this.combatState.maxRounds) {
      this.combatState.round++;
      this.combatState.roundTimeRemaining = GAME_CONFIG.roundDuration;
    } else {
      this.endMatch();
    }
  }
  
  private endMatch(): void {
    this.isMatchActive = false;
  }
  
  getState(): CombatState | null {
    return this.combatState;
  }
  
  isActive(): boolean {
    return this.isMatchActive;
  }
}
