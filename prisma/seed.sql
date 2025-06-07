-- Insert example users
INSERT INTO User (id, email, username, password, firstName, lastName, role, isVerified, isEmailVerified, verificationLevel, createdAt, updatedAt)
VALUES
  ('u1', 'admin@pawpal.com', 'admin', '$2b$10$xxxxxxxxxxxxxxxxxxxxx', 'Admin', 'User', 'ADMIN', 1, 1, 'VERIFIED', NOW(), NOW()),
  ('u2', 'vet@pawpal.com', 'drvet', '$2b$10$xxxxxxxxxxxxxxxxxxxxx', 'Doctor', 'Vet', 'VET', 1, 1, 'VET', NOW(), NOW()),
  ('u3', 'user1@pawpal.com', 'user1', '$2b$10$xxxxxxxxxxxxxxxxxxxxx', 'John', 'Doe', 'USER', 0, 1, 'BASIC', NOW(), NOW()),
  ('u4', 'user2@pawpal.com', 'user2', '$2b$10$xxxxxxxxxxxxxxxxxxxxx', 'Jane', 'Smith', 'USER', 0, 1, 'BASIC', NOW(), NOW());

-- Insert verification documents (ID verifications)
INSERT INTO VerificationDocument (id, userId, documentType, status, createdAt, updatedAt)
VALUES
  ('vd1', 'u3', 'ID_CARD', 'PENDING', NOW(), NOW()),
  ('vd2', 'u4', 'DRIVERS_LICENSE', 'PENDING', NOW(), NOW()),
  ('vd3', 'u3', 'PROOF_OF_ADDRESS', 'PENDING', NOW(), NOW());

-- Insert verification document files
INSERT INTO VerificationDocumentFile (id, verificationDocumentId, documentUrl, createdAt, updatedAt)
VALUES
  ('vdf1', 'vd1', 'https://storage.pawpal.com/verifications/id1.jpg', NOW(), NOW()),
  ('vdf2', 'vd2', 'https://storage.pawpal.com/verifications/license1.jpg', NOW(), NOW()),
  ('vdf3', 'vd3', 'https://storage.pawpal.com/verifications/address1.pdf', NOW(), NOW());

-- Insert vet documents
INSERT INTO VetDocument (id, userId, documentType, documentUrl, status, issueDate, expiryDate, issuingAuthority, licenseNumber, specialization, createdAt, updatedAt)
VALUES
  ('vtd1', 'u2', 'VETERINARY_DEGREE', 'https://storage.pawpal.com/vet/degree1.pdf', 'PENDING', '2020-01-01', '2025-01-01', 'State Veterinary Board', 'VET123', 'Small Animals', NOW(), NOW()),
  ('vtd2', 'u2', 'PRACTICE_LICENSE', 'https://storage.pawpal.com/vet/license1.pdf', 'PENDING', '2023-01-01', '2024-01-01', 'State Medical Board', 'PL456', 'General Practice', NOW(), NOW()),
  ('vtd3', 'u2', 'BOARD_CERTIFICATION', 'https://storage.pawpal.com/vet/cert1.pdf', 'PENDING', '2023-06-01', '2025-06-01', 'American Veterinary Board', 'BC789', 'Surgery', NOW(), NOW());

-- Insert pet profiles
INSERT INTO PetProfile (id, name, species, breed, age, gender, ownerId, createdAt, updatedAt)
VALUES
  ('p1', 'Max', 'DOG', 'Golden Retriever', 3, 'MALE', 'u3', NOW(), NOW()),
  ('p2', 'Luna', 'CAT', 'Persian', 2, 'FEMALE', 'u4', NOW(), NOW());

-- Insert medical records
INSERT INTO MedicalRecord (id, petProfileId, title, description, date, documentUrl, verificationStatus, createdAt, updatedAt)
VALUES
  ('mr1', 'p1', 'Annual Checkup', 'Regular health examination and vaccinations', '2023-12-01', 'https://storage.pawpal.com/medical/record1.pdf', 'PENDING', NOW(), NOW()),
  ('mr2', 'p1', 'Dental Cleaning', 'Professional dental cleaning and examination', '2023-12-15', 'https://storage.pawpal.com/medical/record2.pdf', 'PENDING', NOW(), NOW()),
  ('mr3', 'p2', 'Vaccination', 'Core vaccinations update', '2023-12-20', 'https://storage.pawpal.com/medical/record3.pdf', 'PENDING', NOW(), NOW());

-- Insert clinics
INSERT INTO Clinic (id, name, description, ownerId, verificationStatus, createdAt, updatedAt)
VALUES
  ('c1', 'PawCare Clinic', 'Full-service veterinary clinic', 'u2', 'PENDING', NOW(), NOW());

-- Insert clinic addresses
INSERT INTO FullAddress (id, address, city, state, zipCode, clinicId)
VALUES
  ('a1', '123 Pet Street', 'Pawville', 'CA', '12345', 'c1'); 