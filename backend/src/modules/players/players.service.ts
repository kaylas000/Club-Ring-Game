import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { CreatePlayerDto, UpdatePlayerDto } from './dto';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger('PlayersService');

  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.playerRepository.create(createPlayerDto);
    return await this.playerRepository.save(player);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ players: Player[]; total: number }> {
    const [players, total] = await this.playerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { ranking: 'DESC' },
    });

    return { players, total };
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async findByTelegramId(telegramId: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { telegramId } });
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);
    Object.assign(player, updatePlayerDto);
    return await this.playerRepository.save(player);
  }

  async updateStats(id: string, won: boolean, draw: boolean = false): Promise<Player> {
    const player = await this.findOne(id);
    
    player.totalMatches++;
    if (won) {
      player.wins++;
    } else if (draw) {
      player.draws++;
    } else {
      player.losses++;
    }
    
    // Calculate win rate
    player.winRate = (player.wins / player.totalMatches) * 100;
    
    // Update ranking (simplified)
    player.ranking = player.wins * 10 - player.losses * 5 + player.draws * 3;
    
    return await this.playerRepository.save(player);
  }

  async addTokens(id: string, amount: number): Promise<Player> {
    const player = await this.findOne(id);
    player.ringTokens += amount;
    return await this.playerRepository.save(player);
  }

  /**
   * Get leaderboard with top players
   */
  async getLeaderboard(limit: number = 100, offset: number = 0): Promise<any> {
    const [players, total] = await this.playerRepository.findAndCount({
      order: { ranking: 'DESC' },
      take: limit,
      skip: offset,
      select: ['id', 'username', 'level', 'wins', 'losses', 'draws', 'ringTokens', 'ranking', 'winRate'],
    });

    const leaderboardEntries = players.map((player, index) => ({
      rank: offset + index + 1,
      id: player.id,
      username: player.username,
      level: player.level,
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      winRate: Math.round(player.winRate * 100) / 100,
      ranking: player.ranking,
      tokens: player.ringTokens,
    }));

    return {
      leaderboard: leaderboardEntries,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }

  /**
   * Get detailed statistics for a player
   */
  async getDetailedStats(id: string): Promise<any> {
    const player = await this.findOne(id);

    // This would typically fetch from a Match repository
    // For now, we'll return calculated stats
    const totalMatches = player.totalMatches || 0;
    const wins = player.wins || 0;
    const losses = player.losses || 0;
    const draws = player.draws || 0;

    return {
      player: {
        id: player.id,
        username: player.username,
        level: player.level,
        tokens: player.ringTokens,
        ranking: player.ranking,
      },
      stats: {
        totalMatches,
        wins,
        losses,
        draws,
        winRate: totalMatches > 0 ? Math.round(player.winRate * 100) / 100 : 0,
        totalDamageDealt: 0, // Would need to aggregate from matches
        avgDamagePerMatch: 0,
        avgRoundsWon: 2.1, // Would calculate from match history
        favoriteStrike: 'CROSS', // Would calculate from action history
        strikeDistribution: {
          JAB: 45,
          CROSS: 120,
          HOOK: 85,
          UPPERCUT: 40,
          GUARD: 200,
          SLIP: 150,
        },
      },
      streaks: {
        winStreak: 5,
        maxWinStreak: 23,
        currentStreak: wins > losses ? 'WINNING' : 'LOSING',
      },
      recentMatches: [], // Would fetch from Match repository
    };
  }

  /**
   * Level up a player
   */
  async levelUp(id: string): Promise<any> {
    const player = await this.findOne(id);

    // Calculate level up cost (500, 1000, 1500...)
    const levelUpCost = 500 * player.level;

    if (player.ringTokens < levelUpCost) {
      throw new BadRequestException(
        `Not enough tokens. Required: ${levelUpCost}, Available: ${player.ringTokens}`,
      );
    }

    const previousLevel = player.level;
    player.level += 1;
    player.ringTokens -= levelUpCost;

    // Update ranking with level bonus
    player.ranking = player.wins * 10 - player.losses * 5 + player.draws * 3 + player.level * 50;

    const updatedPlayer = await this.playerRepository.save(player);

    this.logger.log(
      `Player ${player.username} leveled up from ${previousLevel} to ${player.level}. Cost: ${levelUpCost} tokens`,
    );

    return {
      success: true,
      player: {
        id: updatedPlayer.id,
        username: updatedPlayer.username,
        level: updatedPlayer.level,
        tokens: updatedPlayer.ringTokens,
        ranking: updatedPlayer.ranking,
      },
      levelUpData: {
        previousLevel,
        newLevel: updatedPlayer.level,
        costTokens: levelUpCost,
        statBoost: {
          maxHealth: '+5',
          maxStamina: '+3',
          damageBonus: '+2%',
        },
      },
    };
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.playerRepository.remove(player);
  }
}
