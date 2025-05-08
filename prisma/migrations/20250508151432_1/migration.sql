/*
  Warnings:

  - You are about to drop the column `userId` on the `savedpost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `savedpost` DROP FOREIGN KEY `SavedPost_userId_fkey`;

-- DropIndex
DROP INDEX `SavedPost_userId_idx` ON `savedpost`;

-- DropIndex
DROP INDEX `SavedPost_userId_postId_key` ON `savedpost`;

-- AlterTable
ALTER TABLE `savedpost` DROP COLUMN `userId`;
