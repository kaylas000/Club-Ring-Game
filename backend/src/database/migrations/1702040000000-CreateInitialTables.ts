import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1702040000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Players table
    await queryRunner.createTable(
      new Table({
        name: 'players',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'telegramId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'username',
            type: 'varchar',
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'int',
            default: 1,
          },
          {
            name: 'experience',
            type: 'int',
            default: 0,
          },
          {
            name: 'wins',
            type: 'int',
            default: 0,
          },
          {
            name: 'losses',
            type: 'int',
            default: 0,
          },
          {
            name: 'draws',
            type: 'int',
            default: 0,
          },
          {
            name: 'totalMatches',
            type: 'int',
            default: 0,
          },
          {
            name: 'winRate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'ranking',
            type: 'int',
            default: 0,
          },
          {
            name: 'ringTokens',
            type: 'int',
            default: 1000,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'lastActive',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Matches table
    await queryRunner.createTable(
      new Table({
        name: 'matches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'matchId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'player1Id',
            type: 'uuid',
          },
          {
            name: 'player2Id',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'varchar',
            length: 20,
            default: "'PENDING'",
          },
          {
            name: 'winnerId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'loserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'player1Score',
            type: 'int',
            default: 0,
          },
          {
            name: 'player2Score',
            type: 'int',
            default: 0,
          },
          {
            name: 'roundsPlayed',
            type: 'int',
            default: 0,
          },
          {
            name: 'maxRounds',
            type: 'int',
            default: 12,
          },
          {
            name: 'mode',
            type: 'varchar',
            length: 20,
            default: "'RANKED'",
          },
          {
            name: 'difficulty',
            type: 'varchar',
            length: 20,
            default: "'MEDIUM'",
          },
          {
            name: 'player1Wager',
            type: 'int',
            default: 0,
          },
          {
            name: 'player2Wager',
            type: 'int',
            default: 0,
          },
          {
            name: 'actions',
            type: 'text',
            default: "'[]'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
            default: 0,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['player1Id'],
            referencedTableName: 'players',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['player2Id'],
            referencedTableName: 'players',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'players',
      new TableIndex({
        name: 'IDX_players_telegramId',
        columnNames: ['telegramId'],
      }),
    );

    await queryRunner.createIndex(
      'players',
      new TableIndex({
        name: 'IDX_players_ranking',
        columnNames: ['ranking'],
      }),
    );

    await queryRunner.createIndex(
      'matches',
      new TableIndex({
        name: 'IDX_matches_player1Id',
        columnNames: ['player1Id'],
      }),
    );

    await queryRunner.createIndex(
      'matches',
      new TableIndex({
        name: 'IDX_matches_player2Id',
        columnNames: ['player2Id'],
      }),
    );

    await queryRunner.createIndex(
      'matches',
      new TableIndex({
        name: 'IDX_matches_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('matches');
    await queryRunner.dropTable('players');
  }
}
