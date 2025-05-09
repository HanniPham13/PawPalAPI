/*
  Warnings:

  - A unique constraint covering the columns `[chatFileId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `chatFileId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ChatFile` (
    `id` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatFile_chatId_idx`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Message_chatFileId_key` ON `Message`(`chatFileId`);

-- CreateIndex
CREATE INDEX `Message_chatFileId_idx` ON `Message`(`chatFileId`);

-- AddForeignKey
ALTER TABLE `ChatFile` ADD CONSTRAINT `ChatFile_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatFileId_fkey` FOREIGN KEY (`chatFileId`) REFERENCES `ChatFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
