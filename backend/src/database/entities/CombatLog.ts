import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('combat_logs')
export class CombatLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player1Id: string;

  @Column()
  player2Id: string;

  @Column()
  winnerId: string;

  @Column()
  duration: number;

  @Column()
  totalRounds: number;

  @Column()
  expGained: number;

  @Column()
  coinsEarned: number;

  @CreateDateColumn()
  foughtAt: Date;
}
