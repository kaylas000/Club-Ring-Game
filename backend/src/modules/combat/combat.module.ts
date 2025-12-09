import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombatGateway } from './combat.gateway';
import { CombatService } from './combat.service';
import { Player } from '../players/player.entity';
import { Match } from '../matches/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Match])],
  providers: [CombatGateway, CombatService],
  exports: [CombatService],
})
export class CombatModule {}
