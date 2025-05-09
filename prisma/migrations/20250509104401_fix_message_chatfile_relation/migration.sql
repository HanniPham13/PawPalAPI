/*
  Warnings:

  - You are about to drop the column `chatFileId` on the `message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageId]` on the table `ChatFile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_chatFileId_fkey`;

-- DropIndex
DROP INDEX `Message_chatFileId_idx` ON `message`;

-- DropIndex
DROP INDEX `Message_chatFileId_key` ON `message`;

-- AlterTable
ALTER TABLE `chatfile` ADD COLUMN `messageId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `chatFileId`;

-- CreateIndex
CREATE UNIQUE INDEX `ChatFile_messageId_key` ON `ChatFile`(`messageId`);

-- AddForeignKey
ALTER TABLE `ChatFile` ADD CONSTRAINT `ChatFile_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
