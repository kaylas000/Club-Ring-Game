import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GameService } from './game.service';

@Controller('api/game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('combat/start')
  async startCombat(@Body() { opponentId }: { opponentId: string }) {
    return this.gameService.startCombat(opponentId, opponentId);
  }

  @Get('combat/:combatId')
  async getCombat(@Param('combatId') combatId: string) {
    return this.gameService.getCombat(combatId);
  }

  @Post('combat/:combatId/action')
  async executeAction(
    @Param('combatId') combatId: string,
    @Body() action: any,
  ) {
    return this.gameService.executeAction(combatId, action.playerId, action);
  }

  @Get('progress/:playerId')
  async getProgress(@Param('playerId') playerId: string) {
    return this.gameService.getProgress(playerId);
  }

  @Get('achievements/:playerId')
  async getAchievements(@Param('playerId') playerId: string) {
    return this.gameService.getAchievements(playerId);
  }

  @Get('leaderboard/level')
  async getLeaderboardByLevel() {
    return this.gameService.getLeaderboardByLevel(100);
  }

  @Get('leaderboard/wins')
  async getLeaderboardByWins() {
    return this.gameService.getLeaderboardByWins(100);
  }

  @Get('leaderboard/rank/:playerId')
  async getPlayerRank(@Param('playerId') playerId: string) {
    return this.gameService.getPlayerRank(playerId);
  }
}
