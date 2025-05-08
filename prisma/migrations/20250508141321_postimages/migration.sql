/*
  Warnings:

  - You are about to drop the column `images` on the `socialpost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `socialpost` DROP COLUMN `images`;

-- CreateTable
CREATE TABLE `SocialPostImage` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `socialPostId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SocialPostImage` ADD CONSTRAINT `SocialPostImage_socialPostId_fkey` FOREIGN KEY (`socialPostId`) REFERENCES `SocialPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
