import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlayersService } from '../players/players.service';
import * as crypto from 'crypto';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private playersService: PlayersService,
    private configService: ConfigService,
  ) {}

  async validateTelegramAuth(authData: TelegramAuthData): Promise<any> {
    // Verify Telegram authentication
    const isValid = this.verifyTelegramAuth(authData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }

    // Find or create player
    let player = await this.playersService.findByTelegramId(authData.id.toString());
    
    if (!player) {
      player = await this.playersService.create({
        telegramId: authData.id.toString(),
        username: authData.username || authData.first_name,
        avatar: authData.photo_url,
      });
    }

    // Generate JWT token
    const token = this.generateToken(player.id, player.telegramId);

    return {
      player,
      token,
    };
  }

  private verifyTelegramAuth(authData: TelegramAuthData): boolean {
    const botToken = this.configService.get<string>('telegram.botToken');
    if (!botToken) {
      console.warn('Telegram bot token not configured - skipping verification');
      return true; // Allow in development
    }

    // Create data check string
    const dataCheckArr = [];
    for (const [key, value] of Object.entries(authData)) {
      if (key !== 'hash') {
        dataCheckArr.push(`${key}=${value}`);
      }
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Create secret key
    const secretKey = crypto
      .createHash('sha256')
      .update(botToken)
      .digest();

    // Create hash
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hash === authData.hash;
  }

  private generateToken(playerId: string, telegramId: string): string {
    const payload = { sub: playerId, telegramId };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
