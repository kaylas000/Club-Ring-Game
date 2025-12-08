import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramAuth(@Body() authData: any) {
    return await this.authService.validateTelegramAuth(authData);
  }

  @Post('verify')
  async verify(@Body('token') token: string) {
    return await this.authService.verifyToken(token);
  }
}
