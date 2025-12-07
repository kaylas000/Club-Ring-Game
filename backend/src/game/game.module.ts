import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { CombatService } from './combat.service';
import { ProgressionService } from './progression.service';
import { AchievementService } from './achievement.service';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      'Player',
      'Achievement',
      'CombatLog',
    ]),
  ],
  controllers: [GameController],
  providers: [
    GameService,
    CombatService,
    ProgressionService,
    AchievementService,
    LeaderboardService,
  ],
  exports: [
    CombatService,
    ProgressionService,
    AchievementService,
    LeaderboardService,
  ],
})
export class GameModule {}
