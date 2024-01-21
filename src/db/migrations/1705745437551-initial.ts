import { type MigrationInterface, type QueryRunner } from 'typeorm'

export class Initial1705745437551 implements MigrationInterface {
  name = 'Initial1705745437551'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `sessions` (`id` varchar(36) NOT NULL, `ip` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `lastActiveDate` datetime NOT NULL, `deviceId` varchar(255) NOT NULL, `deviceName` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, `RFTokenIAT` datetime NOT NULL, `profileId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `profiles` (`id` varchar(36) NOT NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `male` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `photoName` varchar(255) NOT NULL, `passwordHash` varchar(255) NOT NULL, `regDateId` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'ALTER TABLE `sessions` ADD CONSTRAINT `FK_72445b58af61b4241eb456a3fe1` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `sessions` DROP FOREIGN KEY `FK_72445b58af61b4241eb456a3fe1`'
    )
    await queryRunner.query('DROP TABLE `profiles`')
    await queryRunner.query('DROP TABLE `sessions`')
  }
}
