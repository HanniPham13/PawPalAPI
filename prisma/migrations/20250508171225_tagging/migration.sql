-- DropForeignKey
ALTER TABLE `petadoptionpost` DROP FOREIGN KEY `PetAdoptionPost_petProfileId_fkey`;

-- AlterTable
ALTER TABLE `petadoptionpost` MODIFY `petProfileId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PetAdoptionPost` ADD CONSTRAINT `PetAdoptionPost_petProfileId_fkey` FOREIGN KEY (`petProfileId`) REFERENCES `PetProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
