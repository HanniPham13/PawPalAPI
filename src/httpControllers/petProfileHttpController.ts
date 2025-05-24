import { Request, Response } from 'express';
import {
  createPetProfile,
  updatePetProfile,
  getUserPets,
  getPetProfile,
  deletePetProfile
} from '../functionControllers/petProfileFunctionController';

export const createPetProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const petProfile = await createPetProfile(req, userId);
    res.status(201).json({
      success: true,
      data: petProfile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create pet profile'
    });
  }
};

export const updatePetProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const petId = req.params.id;
    const petProfile = await updatePetProfile(req, userId, petId);
    res.json({
      success: true,
      data: petProfile
    });
  } catch (error: any) {
    res.status(error.message === 'Pet profile not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to update pet profile'
    });
  }
};

export const getUserPetsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const pets = await getUserPets(userId);
    res.json({
      success: true,
      data: pets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user pets'
    });
  }
};

export const getPetProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const petId = req.params.id;
    const petProfile = await getPetProfile(petId, userId);
    res.json({
      success: true,
      data: petProfile
    });
  } catch (error: any) {
    res.status(error.message === 'Pet profile not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch pet profile'
    });
  }
};

export const deletePetProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const petId = req.params.id;
    await deletePetProfile(petId, userId);
    res.json({
      success: true,
      message: 'Pet profile deleted successfully'
    });
  } catch (error: any) {
    res.status(error.message === 'Pet profile not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to delete pet profile'
    });
  }
}; 