import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  achievementId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  earnedAt: Date;
}
