import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { PlayersService } from '../players/players.service';
import { CombatService } from '../combat/combat.service';
import { CreateMatchDto, UpdateMatchDto } from './dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger('MatchesService');

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private playersService: PlayersService,
    private combatService: CombatService,
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

  /**
   * Initialize a new match with combat state
   * Called when match starts
   */
  async initializeMatch(matchId: string, player1Id: string, player2Id: string): Promise<any> {
    try {
      // Validate players exist
      const player1 = await this.playersService.findOne(player1Id);
      const player2 = await this.playersService.findOne(player2Id);

      if (!player1 || !player2) {
        throw new BadRequestException('One or both players not found');
      }

      // Initialize combat state
      const matchState = this.combatService.initializeMatch(matchId, player1Id, player2Id);

      this.logger.log(`Match initialized: ${matchId} (${player1.username} vs ${player2.username})`);

      return {
        success: true,
        matchId,
        matchState,
        players: {
          player1: { id: player1.id, username: player1.username, level: player1.level },
          player2: { id: player2.id, username: player2.username, level: player2.level },
        },
      };
    } catch (error) {
      this.logger.error(`Failed to initialize match: ${error.message}`);
      throw error;
    }
  }

  /**
   * Complete match and award rewards
   * Called when match ends
   */
  async completeMatch(
    matchId: string,
    winnerId: string,
    player1Score: number,
    player2Score: number,
    duration: number,
  ): Promise<Match> {
    try {
      const match = await this.findByMatchId(matchId);
      if (!match) {
        throw new NotFoundException(`Match ${matchId} not found`);
      }

      const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
      const isDraw = winnerId === 'DRAW';

      // Update match
      match.status = 'COMPLETED';
      match.winnerId = isDraw ? 'DRAW' : winnerId;
      match.loserId = isDraw ? null : loserId;
      match.player1Score = player1Score;
      match.player2Score = player2Score;
      match.duration = duration;
      match.completedAt = new Date();

      // Update player stats
      const player1Won = winnerId === match.player1Id;

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

      // Award tokens (rewards)
      let player1Reward = 0;
      let player2Reward = 0;

      if (isDraw) {
        // Draw: both get equal
        player1Reward = 50;
        player2Reward = 50;
      } else if (player1Won) {
        // Winner gets more
        player1Reward = Math.min(50 + Math.floor(player1Score / 5), 300);
        player2Reward = Math.min(25 + Math.floor(player2Score / 10), 100);
      } else {
        // Player 2 won
        player2Reward = Math.min(50 + Math.floor(player2Score / 5), 300);
        player1Reward = Math.min(25 + Math.floor(player1Score / 10), 100);
      }

      // Award tokens
      await this.playersService.addTokens(match.player1Id, player1Reward);
      await this.playersService.addTokens(match.player2Id, player2Reward);

      const savedMatch = await this.matchRepository.save(match);

      this.logger.log(
        `Match completed: ${matchId} - Winner: ${winnerId || 'DRAW'} - Rewards: P1=${player1Reward}, P2=${player2Reward}`,
      );

      return savedMatch;
    } catch (error) {
      this.logger.error(`Failed to complete match: ${error.message}`);
      throw error;
    }
  }

  async getMatchStats(playerId: string): Promise<any> {
    const matches = await this.findByPlayer(playerId, 100);
    
    const wins = matches.filter(m => m.winnerId === playerId).length;
    const losses = matches.filter(m => m.loserId === playerId).length;
    const draws = matches.filter(m => m.winnerId === 'DRAW' && m.status === 'COMPLETED').length;
    const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
    const totalDamageDealt = matches.reduce((sum, m) => {
      if (m.player1Id === playerId) {
        return sum + (m.player1Score || 0);
      } else {
        return sum + (m.player2Score || 0);
      }
    }, 0);

    return {
      totalMatches: matches.length,
      wins,
      losses,
      draws,
      winRate: Math.round(winRate * 100) / 100,
      totalDamageDealt,
      avgDamagePerMatch: matches.length > 0 ? Math.round(totalDamageDealt / matches.length) : 0,
      lastMatch: matches[0] || null,
      lastMatches: matches.slice(0, 10),
    };
  }

  /**
   * Get match by matchId (for WebSocket)
   */
  async getMatchState(matchId: string): Promise<any> {
    const match = await this.findByMatchId(matchId);
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    // Get current state from combat service if active
    try {
      const matchState = this.combatService.getMatchState(matchId);
      return {
        match,
        matchState,
      };
    } catch (error) {
      // Match not in active state
      return {
        match,
        matchState: null,
      };
    }
  }
}
