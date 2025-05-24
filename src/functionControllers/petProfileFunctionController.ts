import { Request } from 'express';
import PetProfile, { IPetProfile } from '../models/PetProfile';

export const createPetProfile = async (req: Request, userId: string): Promise<IPetProfile> => {
  const {
    name,
    species,
    breed,
    age,
    gender,
    size,
    color,
    description,
    profilePicture // Now expecting a base64 string
  } = req.body;

  const petProfile = new PetProfile({
    owner: userId,
    name,
    species,
    breed,
    age,
    gender,
    size,
    color,
    description,
    profilePicture
  });

  await petProfile.save();
  return petProfile;
};

export const updatePetProfile = async (req: Request, userId: string, petId: string): Promise<IPetProfile> => {
  const petProfile = await PetProfile.findOne({ _id: petId, owner: userId });
  if (!petProfile) {
    throw new Error('Pet profile not found');
  }

  const {
    name,
    species,
    breed,
    age,
    gender,
    size,
    color,
    description,
    isAdoptable,
    profilePicture // Now expecting a base64 string
  } = req.body;

  Object.assign(petProfile, {
    name,
    species,
    breed,
    age,
    gender,
    size,
    color,
    description,
    profilePicture,
    isAdoptable
  });

  await petProfile.save();
  return petProfile;
};

export const getUserPets = async (userId: string): Promise<IPetProfile[]> => {
  return PetProfile.find({ owner: userId }).sort({ createdAt: -1 });
};

export const getPetProfile = async (petId: string, userId: string): Promise<IPetProfile> => {
  const petProfile = await PetProfile.findOne({ _id: petId, owner: userId });
  if (!petProfile) {
    throw new Error('Pet profile not found');
  }
  return petProfile;
};

export const deletePetProfile = async (petId: string, userId: string): Promise<void> => {
  const result = await PetProfile.deleteOne({ _id: petId, owner: userId });
  if (result.deletedCount === 0) {
    throw new Error('Pet profile not found');
  }
}; 