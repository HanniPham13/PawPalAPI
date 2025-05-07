-- AlterTable
ALTER TABLE `user` ADD COLUMN `loggedInAsGoogle` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verificationCode` VARCHAR(191) NULL;
