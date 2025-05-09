import { PrismaClient, PetSpecies, PetGender, PetSize } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface CreatePetProfileData {
  name: string;
  species: PetSpecies;
  breed?: string;
  age?: number;
  gender?: PetGender;
  size?: PetSize;
  color?: string;
  description?: string;
  isAdoptable?: boolean;
  profilePicture?: string;
}

export interface UpdatePetProfileData {
  name?: string;
  species?: PetSpecies;
  breed?: string;
  age?: number;
  gender?: PetGender;
  size?: PetSize;
  color?: string;
  description?: string;
  isAdoptable?: boolean;
  profilePicture?: string;
}

export interface MedicalRecordData {
  title: string;
  description: string;
  date: Date;
  documentUrl?: string;
}

export interface UpdateMedicalRecordData {
  title?: string;
  description?: string;
  date?: Date;
  documentUrl?: string;
}

export const createPetProfile = async (
  ownerId: string,
  petData: CreatePetProfileData
) => {
  try {
    // Validate owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Create pet profile
    const newPet = await prisma.petProfile.create({
      data: {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        size: petData.size,
        color: petData.color,
        description: petData.description,
        isAdoptable: petData.isAdoptable || false,
        profilePicture: petData.profilePicture,
        owner: {
          connect: { id: ownerId }
        }
      }
    });

    return {
      success: true,
      message: 'Pet profile created successfully',
      data: newPet
    };
  } catch (error) {
    console.error('Error creating pet profile:', error);
    return {
      success: false,
      message: 'Failed to create pet profile'
    };
  }
};

export const updatePetProfile = async (
  petId: string,
  ownerId: string,
  updateData: UpdatePetProfileData
) => {
  try {
    // Check if pet exists and belongs to this owner
    const existingPet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!existingPet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to edit it'
      };
    }

    // Store old profile picture path to delete if needed
    const oldProfilePicture = existingPet.profilePicture;

    // Update pet profile
    const updatedPet = await prisma.petProfile.update({
      where: { id: petId },
      data: updateData
    });

    // Delete old profile picture if it was replaced
    if (oldProfilePicture && updateData.profilePicture && oldProfilePicture !== updateData.profilePicture) {
      try {
        fs.unlinkSync(path.join(process.cwd(), oldProfilePicture));
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
        // Proceed anyway as this is not critical
      }
    }

    return {
      success: true,
      message: 'Pet profile updated successfully',
      data: updatedPet
    };
  } catch (error) {
    console.error('Error updating pet profile:', error);
    return {
      success: false,
      message: 'Failed to update pet profile'
    };
  }
};

export const deletePetProfile = async (petId: string, ownerId: string) => {
  try {
    // Check if pet exists and belongs to this owner
    const pet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to delete it'
      };
    }

    // Delete the pet profile
    await prisma.petProfile.delete({
      where: { id: petId }
    });

    // Clean up profile picture if it exists
    if (pet.profilePicture) {
      try {
        fs.unlinkSync(path.join(process.cwd(), pet.profilePicture));
      } catch (err) {
        console.error('Error deleting profile picture:', err);
        // Proceed anyway as the pet was already deleted from the database
      }
    }

    return {
      success: true,
      message: 'Pet profile deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting pet profile:', error);
    return {
      success: false,
      message: 'Failed to delete pet profile'
    };
  }
};

export const getPetProfile = async (petId: string) => {
  try {
    const pet = await prisma.petProfile.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found'
      };
    }

    return {
      success: true,
      message: 'Pet profile retrieved successfully',
      data: pet
    };
  } catch (error) {
    console.error('Error retrieving pet profile:', error);
    return {
      success: false,
      message: 'Failed to retrieve pet profile'
    };
  }
};

export const getUserPets = async (ownerId: string) => {
  try {
    const pets = await prisma.petProfile.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      message: 'Pet profiles retrieved successfully',
      data: pets
    };
  } catch (error) {
    console.error('Error retrieving user pets:', error);
    return {
      success: false,
      message: 'Failed to retrieve pet profiles'
    };
  }
};

export const toggleAdoptableStatus = async (petId: string, ownerId: string) => {
  try {
    // Check if pet exists and belongs to this owner
    const pet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to modify it'
      };
    }

    // Toggle isAdoptable status
    const updatedPet = await prisma.petProfile.update({
      where: { id: petId },
      data: { isAdoptable: !pet.isAdoptable }
    });

    return {
      success: true,
      message: `Pet is now ${updatedPet.isAdoptable ? 'available' : 'not available'} for adoption`,
      data: updatedPet
    };
  } catch (error) {
    console.error('Error toggling adoptable status:', error);
    return {
      success: false,
      message: 'Failed to update pet adoption status'
    };
  }
};

// Medical record functions

export const addMedicalRecord = async (
  petId: string,
  ownerId: string,
  medicalData: MedicalRecordData
) => {
  try {
    // Check if pet exists and belongs to this owner
    const pet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to add medical records'
      };
    }

    // Create medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        title: medicalData.title,
        description: medicalData.description,
        date: medicalData.date,
        documentUrl: medicalData.documentUrl,
        petProfile: {
          connect: { id: petId }
        }
      }
    });

    return {
      success: true,
      message: 'Medical record added successfully',
      data: medicalRecord
    };
  } catch (error) {
    console.error('Error adding medical record:', error);
    return {
      success: false,
      message: 'Failed to add medical record'
    };
  }
};

export const updateMedicalRecord = async (
  recordId: string,
  petId: string,
  ownerId: string,
  updateData: UpdateMedicalRecordData
) => {
  try {
    // Check if pet exists and belongs to this owner
    const pet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to update medical records'
      };
    }

    // Check if medical record exists and belongs to this pet
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        petProfileId: petId
      }
    });

    if (!existingRecord) {
      return {
        success: false,
        message: 'Medical record not found'
      };
    }

    // Store old document URL to delete if needed
    const oldDocumentUrl = existingRecord.documentUrl;

    // Update medical record
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: updateData
    });

    // Delete old document if it was replaced
    if (oldDocumentUrl && updateData.documentUrl && oldDocumentUrl !== updateData.documentUrl) {
      try {
        fs.unlinkSync(path.join(process.cwd(), oldDocumentUrl));
      } catch (err) {
        console.error('Error deleting old medical document:', err);
        // Proceed anyway as this is not critical
      }
    }

    return {
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord
    };
  } catch (error) {
    console.error('Error updating medical record:', error);
    return {
      success: false,
      message: 'Failed to update medical record'
    };
  }
};

export const deleteMedicalRecord = async (
  recordId: string,
  petId: string,
  ownerId: string
) => {
  try {
    // Check if pet exists and belongs to this owner
    const pet = await prisma.petProfile.findFirst({
      where: {
        id: petId,
        ownerId: ownerId
      }
    });

    if (!pet) {
      return {
        success: false,
        message: 'Pet profile not found or you do not have permission to delete medical records'
      };
    }

    // Check if medical record exists and belongs to this pet
    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        petProfileId: petId
      }
    });

    if (!record) {
      return {
        success: false,
        message: 'Medical record not found'
      };
    }

    // Delete the medical record
    await prisma.medicalRecord.delete({
      where: { id: recordId }
    });

    // Clean up document file if it exists
    if (record.documentUrl) {
      try {
        fs.unlinkSync(path.join(process.cwd(), record.documentUrl));
      } catch (err) {
        console.error('Error deleting medical document:', err);
        // Proceed anyway as the record was already deleted from the database
      }
    }

    return {
      success: true,
      message: 'Medical record deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return {
      success: false,
      message: 'Failed to delete medical record'
    };
  }
};

export const getMedicalRecords = async (petId: string) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { petProfileId: petId },
      orderBy: { date: 'desc' }
    });

    return {
      success: true,
      message: 'Medical records retrieved successfully',
      data: records
    };
  } catch (error) {
    console.error('Error retrieving medical records:', error);
    return {
      success: false,
      message: 'Failed to retrieve medical records'
    };
  }
};

export const getMedicalRecord = async (recordId: string, petId: string) => {
  try {
    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        petProfileId: petId
      }
    });

    if (!record) {
      return {
        success: false,
        message: 'Medical record not found'
      };
    }

    return {
      success: true,
      message: 'Medical record retrieved successfully',
      data: record
    };
  } catch (error) {
    console.error('Error retrieving medical record:', error);
    return {
      success: false,
      message: 'Failed to retrieve medical record'
    };
  }
};
