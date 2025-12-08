import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { CreatePlayerDto, UpdatePlayerDto } from './dto';

@Injectable()
export class PlayersService {
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

  async getLeaderboard(limit: number = 100): Promise<Player[]> {
    return await this.playerRepository.find({
      order: { ranking: 'DESC' },
      take: limit,
    });
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.playerRepository.remove(player);
  }
}
