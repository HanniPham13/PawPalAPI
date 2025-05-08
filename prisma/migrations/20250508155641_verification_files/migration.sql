/*
  Warnings:

  - You are about to drop the column `documentUrl` on the `verificationdocument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `verificationdocument` DROP COLUMN `documentUrl`;

-- CreateTable
CREATE TABLE `VerificationDocumentFile` (
    `id` VARCHAR(191) NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `verificationDocumentId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerificationDocumentFile` ADD CONSTRAINT `VerificationDocumentFile_verificationDocumentId_fkey` FOREIGN KEY (`verificationDocumentId`) REFERENCES `VerificationDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
