import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProgressionService {
  constructor(
    @InjectRepository('Player')
    private playerRepository: Repository<any>,
  ) {}

  /**
   * Добавляет опыт игроку
   */
  async addExperience(playerId: string, amount: number): Promise<any> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) return { error: 'Player not found' };

    player.experience += amount;
    player.totalExperience += amount;

    const levelExp = this.getExpForLevel(player.level + 1);
    if (player.experience >= levelExp) {
      return this.levelUp(player);
    }

    return this.playerRepository.save(player);
  }

  /**
   * Повышение уровня с наградами
   */
  private async levelUp(player: any): Promise<any> {
    player.level++;
    player.experience = 0;
    player.maxHealth += 10;
    player.attackPower += 5;
    player.defense += 3;
    player.coins += 500;

    player.health = player.maxHealth;

    return this.playerRepository.save(player);
  }

  /**
   * Опыт для следующего уровня
   */
  private getExpForLevel(level: number): number {
    return 100 * level * (level + 1) / 2;
  }

  /**
   * Получить прогресс игрока
   */
  async getProgress(playerId: string): Promise<any> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) return { error: 'Player not found' };

    const nextLevelExp = this.getExpForLevel(player.level + 1);
    const currentLevelExp = this.getExpForLevel(player.level);

    return {
      level: player.level,
      experience: player.experience,
      nextLevelExp,
      progressPercent: ((player.experience - currentLevelExp) / 
                       (nextLevelExp - currentLevelExp)) * 100,
      stats: {
        health: player.health,
        maxHealth: player.maxHealth,
        attackPower: player.attackPower,
        defense: player.defense,
      },
      coins: player.coins,
      wins: player.wins,
      losses: player.losses,
    };
  }
}
