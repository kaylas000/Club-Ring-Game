import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  telegramId: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ringTokens?: number;
}
