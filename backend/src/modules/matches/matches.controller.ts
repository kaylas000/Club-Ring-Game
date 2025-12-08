import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
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

  @Post(':id/complete')
  completeMatch(
    @Param('id') id: string,
    @Body() data: {
      winnerId: string;
      player1Score: number;
      player2Score: number;
      duration: number;
    },
  ) {
    return this.matchesService.completeMatch(
      data.winnerId,
      data.winnerId,
      data.player1Score,
      data.player2Score,
      data.duration,
    );
  }
}
