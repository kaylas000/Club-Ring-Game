import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CombatActionDto {
  @IsString()
  matchId: string;

  @IsString()
  playerId: string;

  @IsString()
  actionType: 'ATTACK' | 'DEFEND';

  @IsString()
  moveType: string;

  @IsNumber()
  @IsOptional()
  damage?: number;

  @IsBoolean()
  @IsOptional()
  isCritical?: boolean;

  @IsNumber()
  timestamp: number;
}
