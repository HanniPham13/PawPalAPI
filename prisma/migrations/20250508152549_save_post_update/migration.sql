/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `SavedPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `SavedPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `savedpost` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `SavedPost_userId_idx` ON `SavedPost`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `SavedPost_userId_postId_key` ON `SavedPost`(`userId`, `postId`);

-- AddForeignKey
ALTER TABLE `SavedPost` ADD CONSTRAINT `SavedPost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
