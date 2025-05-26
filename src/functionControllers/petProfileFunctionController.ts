import { prisma } from '../index';
import { PetProfile, PetSpecies, PetGender, PetSize } from '@prisma/client';

export const createPetProfile = async (userId: string, data: {
  name: string;
  species: PetSpecies;
  breed?: string;
  age?: number;
  gender?: PetGender;
  size?: PetSize;
  color?: string;
  description?: string;
  profilePicture?: string;
  isAdoptable?: boolean;
}): Promise<PetProfile> => {
  return prisma.petProfile.create({
    data: {
      ...data,
      owner: {
        connect: { id: userId }
      }
    }
  });
};

export const updatePetProfile = async (userId: string, petId: string, data: {
  name?: string;
  species?: PetSpecies;
  breed?: string;
  age?: number;
  gender?: PetGender;
  size?: PetSize;
  color?: string;
  description?: string;
  profilePicture?: string;
  isAdoptable?: boolean;
}): Promise<PetProfile | null> => {
  const petProfile = await prisma.petProfile.findFirst({
    where: {
      id: petId,
      ownerId: userId
    }
  });

  if (!petProfile) {
    return null;
  }

  return prisma.petProfile.update({
    where: { id: petId },
    data
  });
};

export const getUserPetProfiles = async (userId: string): Promise<PetProfile[]> => {
  return prisma.petProfile.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const deletePetProfile = async (userId: string, petId: string): Promise<boolean> => {
  const petProfile = await prisma.petProfile.findFirst({
    where: {
      id: petId,
      ownerId: userId
    }
  });

  if (!petProfile) {
    return false;
  }

  await prisma.petProfile.delete({
    where: { id: petId }
  });

  return true;
}; 