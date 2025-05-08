/*
  Warnings:

  - You are about to drop the column `petId` on the `adoptionapplication` table. All the data in the column will be lost.
  - You are about to drop the column `petId` on the `medicalrecord` table. All the data in the column will be lost.
  - You are about to drop the `pet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adoptionPostId` to the `AdoptionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petProfileId` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_pettagged` DROP FOREIGN KEY `_petTagged_A_fkey`;

-- DropForeignKey
ALTER TABLE `_pettagged` DROP FOREIGN KEY `_petTagged_B_fkey`;

-- DropForeignKey
ALTER TABLE `adoptionapplication` DROP FOREIGN KEY `AdoptionApplication_petId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `medicalrecord` DROP FOREIGN KEY `MedicalRecord_petId_fkey`;

-- DropForeignKey
ALTER TABLE `pet` DROP FOREIGN KEY `Pet_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `reaction` DROP FOREIGN KEY `Reaction_postId_fkey`;

-- DropIndex
DROP INDEX `AdoptionApplication_petId_idx` ON `adoptionapplication`;

-- DropIndex
DROP INDEX `MedicalRecord_petId_idx` ON `medicalrecord`;

-- AlterTable
ALTER TABLE `adoptionapplication` DROP COLUMN `petId`,
    ADD COLUMN `adoptionPostId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `medicalrecord` DROP COLUMN `petId`,
    ADD COLUMN `petProfileId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `pet`;

-- DropTable
DROP TABLE `post`;

-- CreateTable
CREATE TABLE `PetProfile` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `species` ENUM('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'GUINEA_PIG', 'FISH', 'REPTILE', 'OTHER') NOT NULL,
    `breed` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `gender` ENUM('MALE', 'FEMALE', 'UNKNOWN') NULL,
    `size` ENUM('EXTRA_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE') NULL,
    `color` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `profilePicture` VARCHAR(191) NULL,
    `isAdoptable` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    INDEX `PetProfile_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialPost` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `images` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `SocialPost_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PetAdoptionPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `images` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `petProfileId` VARCHAR(191) NOT NULL,

    INDEX `PetAdoptionPost_authorId_idx`(`authorId`),
    INDEX `PetAdoptionPost_petProfileId_idx`(`petProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `petProfileId` VARCHAR(191) NULL,
    `socialPostId` VARCHAR(191) NULL,
    `adoptionPostId` VARCHAR(191) NULL,

    INDEX `Favorite_userId_idx`(`userId`),
    INDEX `Favorite_petProfileId_idx`(`petProfileId`),
    INDEX `Favorite_socialPostId_idx`(`socialPostId`),
    INDEX `Favorite_adoptionPostId_idx`(`adoptionPostId`),
    UNIQUE INDEX `Favorite_userId_petProfileId_key`(`userId`, `petProfileId`),
    UNIQUE INDEX `Favorite_userId_socialPostId_key`(`userId`, `socialPostId`),
    UNIQUE INDEX `Favorite_userId_adoptionPostId_key`(`userId`, `adoptionPostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AdoptionApplication_adoptionPostId_idx` ON `AdoptionApplication`(`adoptionPostId`);

-- CreateIndex
CREATE INDEX `MedicalRecord_petProfileId_idx` ON `MedicalRecord`(`petProfileId`);

-- AddForeignKey
ALTER TABLE `PetProfile` ADD CONSTRAINT `PetProfile_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialPost` ADD CONSTRAINT `SocialPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetAdoptionPost` ADD CONSTRAINT `PetAdoptionPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PetAdoptionPost` ADD CONSTRAINT `PetAdoptionPost_petProfileId_fkey` FOREIGN KEY (`petProfileId`) REFERENCES `PetProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_petProfileId_fkey` FOREIGN KEY (`petProfileId`) REFERENCES `PetProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_socialPostId_fkey` FOREIGN KEY (`socialPostId`) REFERENCES `SocialPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_adoptionPostId_fkey` FOREIGN KEY (`adoptionPostId`) REFERENCES `PetAdoptionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `SocialPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `SocialPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_petProfileId_fkey` FOREIGN KEY (`petProfileId`) REFERENCES `PetProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdoptionApplication` ADD CONSTRAINT `AdoptionApplication_adoptionPostId_fkey` FOREIGN KEY (`adoptionPostId`) REFERENCES `PetAdoptionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_petTagged` ADD CONSTRAINT `_petTagged_A_fkey` FOREIGN KEY (`A`) REFERENCES `PetProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_petTagged` ADD CONSTRAINT `_petTagged_B_fkey` FOREIGN KEY (`B`) REFERENCES `SocialPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
