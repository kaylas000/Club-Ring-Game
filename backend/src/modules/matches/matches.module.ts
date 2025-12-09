import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './match.entity';
import { PlayersModule } from '../players/players.module';
import { CombatModule } from '../combat/combat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    PlayersModule,
    CombatModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
