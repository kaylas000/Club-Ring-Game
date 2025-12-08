import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UpdateMatchDto {
  @IsEnum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  player1Score?: number;

  @IsNumber()
  @IsOptional()
  player2Score?: number;

  @IsNumber()
  @IsOptional()
  roundsPlayed?: number;

  @IsString()
  @IsOptional()
  winnerId?: string;
}
