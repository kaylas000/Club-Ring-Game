import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_combat',
    name: 'First Battle',
    description: 'Win your first combat',
    icon: '⚔️',
    requirement: 1,
    reward: 100,
  },
  {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '📈',
    requirement: 10,
    reward: 500,
  },
  {
    id: 'ten_wins',
    name: 'Ten Wins',
    description: 'Win 10 battles',
    icon: '🏆',
    requirement: 10,
    reward: 250,
  },
  {
    id: 'legendary_damage',
    name: 'Legendary Damage',
    description: 'Deal 50+ damage',
    icon: '💥',
    requirement: 50,
    reward: 1000,
  },
  {
    id: 'perfect_match',
    name: 'Perfect Battle',
    description: 'Win without damage',
    icon: '✨',
    requirement: 1,
    reward: 750,
  },
];

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository('Achievement')
    private achievementRepository: Repository<any>,
    @InjectRepository('Player')
    private playerRepository: Repository<any>,
  ) {}

  async checkAchievements(playerId: string, metric: string, value: number): Promise<any[]> {
    const newAchievements = [];
    const player = await this.playerRepository.findOne({ where: { id: playerId } });

    if (!player) return [];

    for (const achievement of ACHIEVEMENTS) {
      const hasAchievement = await this.achievementRepository.findOne({
        where: { playerId, achievementId: achievement.id },
      });

      if (hasAchievement) continue;

      let earned = false;
      switch (achievement.id) {
        case 'first_combat':
          if (metric === 'combats' && value >= 1) earned = true;
          break;
        case 'level_10':
          if (metric === 'level' && value >= 10) earned = true;
          break;
        case 'ten_wins':
          if (metric === 'wins' && value >= 10) earned = true;
          break;
        case 'legendary_damage':
          if (metric === 'damage' && value >= 50) earned = true;
          break;
        case 'perfect_match':
          if (metric === 'perfectMatch' && value === 1) earned = true;
          break;
      }

      if (earned) {
        const earned_achievement = await this.achievementRepository.save({
          playerId,
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          earnedAt: new Date(),
        });

        player.coins += achievement.reward;
        await this.playerRepository.save(player);
        newAchievements.push({
          ...achievement,
          earnedAt: earned_achievement.earnedAt,
        });
      }
    }

    return newAchievements;
  }

  async getPlayerAchievements(playerId: string): Promise<any[]> {
    return this.achievementRepository.find({
      where: { playerId },
    });
  }
}
