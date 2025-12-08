import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from '../players/player.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column()
  player1Id: string;

  @Column()
  player2Id: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player1Id' })
  player1: Player;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player2Id' })
  player2: Player;

  @Column({ type: 'varchar', length: 20 })
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

  @Column()
  winnerId: string;

  @Column({ nullable: true })
  loserId: string;

  @Column({ default: 0 })
  player1Score: number;

  @Column({ default: 0 })
  player2Score: number;

  @Column({ default: 0 })
  roundsPlayed: number;

  @Column({ default: 12 })
  maxRounds: number;

  @Column({ type: 'varchar', length: 20, default: 'RANKED' })
  mode: 'PRACTICE' | 'RANKED' | 'TOURNAMENT';

  @Column({ type: 'varchar', length: 20, default: 'MEDIUM' })
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

  @Column({ default: 0 })
  player1Wager: number;

  @Column({ default: 0 })
  player2Wager: number;

  @Column({ type: 'simple-array', default: [] })
  actions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds
}
