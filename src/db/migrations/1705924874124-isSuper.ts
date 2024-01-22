import { MigrationInterface, QueryRunner } from 'typeorm'

export class IsSuper1705924874124 implements MigrationInterface {
  name = 'IsSuper1705924874124'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`isSuper\` tinyint NOT NULL DEFAULT 0`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`isSuper\``)
  }
}
