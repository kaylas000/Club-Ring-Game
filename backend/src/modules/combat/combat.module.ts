import { Module } from '@nestjs/common';
import { CombatGateway } from './combat.gateway';
import { CombatService } from './combat.service';

@Module({
  providers: [CombatGateway, CombatService],
  exports: [CombatService],
})
export class CombatModule {}
