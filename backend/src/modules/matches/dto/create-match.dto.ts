import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  player1Id: string;

  @IsString()
  player2Id: string;

  @IsEnum(['PRACTICE', 'RANKED', 'TOURNAMENT'])
  @IsOptional()
  mode?: string;

  @IsEnum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'])
  @IsOptional()
  difficulty?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  player1Wager?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  player2Wager?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxRounds?: number;
}
