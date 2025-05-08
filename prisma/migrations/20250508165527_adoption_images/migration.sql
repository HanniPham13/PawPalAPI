-- CreateTable
CREATE TABLE `PetAdoptionPostImage` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `petAdoptionPostId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PetAdoptionPostImage` ADD CONSTRAINT `PetAdoptionPostImage_petAdoptionPostId_fkey` FOREIGN KEY (`petAdoptionPostId`) REFERENCES `PetAdoptionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
