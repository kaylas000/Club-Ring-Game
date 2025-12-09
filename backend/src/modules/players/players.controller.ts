import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto, UpdatePlayerDto } from './dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.playersService.findAll(parseInt(page), parseInt(limit));
  }

  /**
   * Get leaderboard with top players
   * GET /players/leaderboard?limit=100&offset=0
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    return await this.playersService.getLeaderboard(parseInt(limit), parseInt(offset));
  }

  /**
   * Get detailed statistics for a player
   * GET /players/:id/stats
   */
  @Get(':id/stats')
  async getDetailedStats(@Param('id') id: string) {
    return await this.playersService.getDetailedStats(id);
  }

  /**
   * Level up a player
   * POST /players/:id/level-up
   */
  @Post(':id/level-up')
  async levelUp(@Param('id') id: string) {
    return await this.playersService.levelUp(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Get('telegram/:telegramId')
  findByTelegramId(@Param('telegramId') telegramId: string) {
    return this.playersService.findByTelegramId(telegramId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Patch(':id/tokens')
  addTokens(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.playersService.addTokens(id, amount);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
