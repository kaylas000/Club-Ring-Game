import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePlayerDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ringTokens?: number;
}
