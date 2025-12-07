import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository('Player')
    private playerRepository: Repository<any>,
  ) {}

  async getTopByLevel(limit: number = 100): Promise<any[]> {
    return this.playerRepository.find({
      order: { level: 'DESC', experience: 'DESC' },
      take: limit,
      select: ['id', 'name', 'level', 'experience', 'wins', 'avatar'],
    });
  }

  async getTopByWins(limit: number = 100): Promise<any[]> {
    return this.playerRepository.find({
      order: { wins: 'DESC' },
      take: limit,
      select: ['id', 'name', 'wins', 'level', 'combats', 'avatar'],
    });
  }

  async getPlayerRank(playerId: string): Promise<any> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) return { error: 'Player not found' };

    const playersWithHigherLevel = await this.playerRepository.count({
      where: { level: player.level },
    });

    return {
      playerName: player.name,
      level: player.level,
      experience: player.experience,
      wins: player.wins,
      losses: player.losses,
      combats: player.combats,
      winRate: player.combats > 0 ? ((player.wins / player.combats) * 100).toFixed(1) : '0',
      rank: playersWithHigherLevel,
    };
  }

  async updateCombatStats(
    winnerId: string,
    loserId: string,
    result: any,
  ): Promise<void> {
    const winner = await this.playerRepository.findOne({
      where: { id: winnerId },
    });
    const loser = await this.playerRepository.findOne({
      where: { id: loserId },
    });

    if (winner) {
      winner.wins++;
      winner.combats++;
      winner.coins += result.coinsEarned;
      await this.playerRepository.save(winner);
    }

    if (loser) {
      loser.combats++;
      loser.losses++;
      await this.playerRepository.save(loser);
    }
  }
}
