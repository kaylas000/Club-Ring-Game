import { Injectable } from '@nestjs/common';

interface MatchmakingPlayer {
  playerId: string;
  characterId: string;
  timestamp: number;
  socketId: string;
}

@Injectable()
export class CombatService {
  private matchmakingQueue: MatchmakingPlayer[] = [];
  private activeMatches = new Map<string, any>();

  async findMatch(playerId: string, characterId: string): Promise<any | null> {
    // Check if there's a player waiting
    if (this.matchmakingQueue.length > 0) {
      const opponent = this.matchmakingQueue.shift()!;
      
      // Create match
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const match = {
        matchId,
        playerId,
        opponentId: opponent.playerId,
        opponentSocketId: opponent.socketId,
        startTime: Date.now(),
        round: 1,
      };
      
      this.activeMatches.set(matchId, match);
      
      return match;
    }
    
    // Add to queue
    this.matchmakingQueue.push({
      playerId,
      characterId,
      timestamp: Date.now(),
      socketId: '', // Will be set by gateway
    });
    
    return null;
  }

  removeFromQueue(playerId: string): void {
    this.matchmakingQueue = this.matchmakingQueue.filter(
      (p) => p.playerId !== playerId,
    );
  }

  async processAction(action: any): Promise<any> {
    // Simplified action processing
    // In production, this would have full combat logic
    
    return {
      success: true,
      damage: Math.floor(Math.random() * 30) + 10,
      isCritical: Math.random() < 0.2,
      roundEnd: false,
      matchEnd: false,
    };
  }

  getActiveMatches(): number {
    return this.activeMatches.size;
  }

  getQueueSize(): number {
    return this.matchmakingQueue.length;
  }
}
