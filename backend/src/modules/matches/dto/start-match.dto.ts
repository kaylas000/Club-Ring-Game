import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class StartMatchDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  player1Id: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  player2Id: string;
}
