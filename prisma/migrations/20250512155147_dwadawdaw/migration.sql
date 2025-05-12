/*
  Warnings:

  - You are about to drop the column `verifiedBy` on the `medicalrecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicalrecord` DROP COLUMN `verifiedBy`,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `verificationStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedById` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `MedicalRecord_verifiedById_idx` ON `MedicalRecord`(`verifiedById`);

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
