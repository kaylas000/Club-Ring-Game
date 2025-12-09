import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Post('start')
  async startMatch(
    @Body() data: { player1Id: string; player2Id: string },
  ) {
    if (!data.player1Id || !data.player2Id) {
      throw new BadRequestException('player1Id and player2Id are required');
    }

    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return await this.matchesService.initializeMatch(
      matchId,
      data.player1Id,
      data.player2Id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Get(':id/state')
  async getMatchState(@Param('id') matchId: string) {
    return await this.matchesService.getMatchState(matchId);
  }

  @Get('player/:playerId')
  findByPlayer(
    @Param('playerId') playerId: string,
    @Query('limit') limit: string = '20',
  ) {
    return this.matchesService.findByPlayer(playerId, parseInt(limit));
  }

  @Get('stats/:playerId')
  getStats(@Param('playerId') playerId: string) {
    return this.matchesService.getMatchStats(playerId);
  }

  @Post(':matchId/complete')
  async completeMatch(
    @Param('matchId') matchId: string,
    @Body()
    data: {
      winnerId: string; // player1Id, player2Id, or 'DRAW'
      player1Score: number; // damage dealt
      player2Score: number; // damage dealt
      duration: number; // seconds
    },
  ) {
    if (!matchId || !data.winnerId) {
      throw new BadRequestException('matchId and winnerId are required');
    }

    return await this.matchesService.completeMatch(
      matchId,
      data.winnerId,
      data.player1Score,
      data.player2Score,
      data.duration,
    );
  }
}
