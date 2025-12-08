import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { PlayersService } from '../players/players.service';
import { CreateMatchDto, UpdateMatchDto } from './dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private playersService: PlayersService,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    // Validate players exist
    await this.playersService.findOne(createMatchDto.player1Id);
    await this.playersService.findOne(createMatchDto.player2Id);

    const match = this.matchRepository.create({
      ...createMatchDto,
      matchId: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
    });

    return await this.matchRepository.save(match);
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['player1', 'player2'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async findByMatchId(matchId: string): Promise<Match | null> {
    return await this.matchRepository.findOne({
      where: { matchId },
      relations: ['player1', 'player2'],
    });
  }

  async findByPlayer(playerId: string, limit: number = 20): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [
        { player1Id: playerId },
        { player2Id: playerId },
      ],
      relations: ['player1', 'player2'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    Object.assign(match, updateMatchDto);
    return await this.matchRepository.save(match);
  }

  async completeMatch(
    matchId: string,
    winnerId: string,
    player1Score: number,
    player2Score: number,
    duration: number,
  ): Promise<Match> {
    const match = await this.findByMatchId(matchId);
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    // Update match
    match.status = 'COMPLETED';
    match.winnerId = winnerId;
    match.loserId = loserId;
    match.player1Score = player1Score;
    match.player2Score = player2Score;
    match.duration = duration;
    match.completedAt = new Date();

    // Update player stats
    const player1Won = winnerId === match.player1Id;
    const isDraw = player1Score === player2Score;

    await this.playersService.updateStats(
      match.player1Id,
      player1Won,
      isDraw,
    );
    await this.playersService.updateStats(
      match.player2Id,
      !player1Won,
      isDraw,
    );

    // Award tokens
    if (player1Won) {
      const reward = Math.floor(match.player1Wager * 1.5);
      await this.playersService.addTokens(match.player1Id, reward);
    } else {
      const reward = Math.floor(match.player2Wager * 1.5);
      await this.playersService.addTokens(match.player2Id, reward);
    }

    return await this.matchRepository.save(match);
  }

  async getMatchStats(playerId: string): Promise<any> {
    const matches = await this.findByPlayer(playerId, 100);
    
    const wins = matches.filter(m => m.winnerId === playerId).length;
    const losses = matches.filter(m => m.loserId === playerId).length;
    const draws = matches.filter(m => m.player1Score === m.player2Score && m.status === 'COMPLETED').length;
    const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;

    return {
      totalMatches: matches.length,
      wins,
      losses,
      draws,
      winRate: Math.round(winRate * 100) / 100,
      lastMatch: matches[0] || null,
    };
  }
}
