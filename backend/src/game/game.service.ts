import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombatService } from './combat.service';
import { ProgressionService } from './progression.service';
import { AchievementService } from './achievement.service';
import { LeaderboardService } from './leaderboard.service';

@Injectable()
export class GameService {
  constructor(
    private combatService: CombatService,
    private progressionService: ProgressionService,
    private achievementService: AchievementService,
    private leaderboardService: LeaderboardService,
    @InjectRepository('CombatLog')
    private combatLogRepository: Repository<any>,
  ) {}

  async startCombat(player1Id: string, player2Id: string) {
    const combatId = this.combatService.initiateCombat(player1Id, player2Id);
    return {
      combatId,
      message: 'Combat started',
      status: 'active',
    };
  }

  async getCombat(combatId: string) {
    return this.combatService.getCombatStatus(combatId);
  }

  async executeAction(combatId: string, playerId: string, action: any) {
    const result = this.combatService.executeAction(combatId, playerId, {
      ...action,
      attackerId: playerId,
      timestamp: Date.now(),
    });

    if (result.winner) {
      await this.onCombatEnd(result);
    }

    return result;
  }

  private async onCombatEnd(result: any) {
    try {
      await this.combatLogRepository.save({
        player1Id: result.loser,
        player2Id: result.winner,
        winnerId: result.winner,
        duration: result.duration,
        totalRounds: result.round,
        expGained: result.expGained,
        coinsEarned: result.coinsEarned,
      });
    } catch (error) {
      console.log('Error saving combat log:', error);
    }

    await this.progressionService.addExperience(result.winner, result.expGained);
    await this.leaderboardService.updateCombatStats(
      result.winner,
      result.loser,
      result,
    );

    return { achievements: [], rewards: result };
  }

  async getProgress(playerId: string) {
    return this.progressionService.getProgress(playerId);
  }

  async getAchievements(playerId: string) {
    return this.achievementService.getPlayerAchievements(playerId);
  }

  async getLeaderboardByLevel(limit: number = 100) {
    return this.leaderboardService.getTopByLevel(limit);
  }

  async getLeaderboardByWins(limit: number = 100) {
    return this.leaderboardService.getTopByWins(limit);
  }

  async getPlayerRank(playerId: string) {
    return this.leaderboardService.getPlayerRank(playerId);
  }
}
