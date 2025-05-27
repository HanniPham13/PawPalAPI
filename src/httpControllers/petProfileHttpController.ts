import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as petProfileFunctionController from '../functionControllers/petProfileFunctionController';

export const handleCreatePetProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const petProfile = await petProfileFunctionController.createPetProfile(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Pet profile created successfully',
      data: petProfile
    });
  } catch (error) {
    console.error('Create pet profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to create pet profile' });
  }
};

export const handleUpdatePetProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId } = req.params;
    const updatedProfile = await petProfileFunctionController.updatePetProfile(userId, petId, req.body);

    if (!updatedProfile) {
      res.status(404).json({ success: false, message: 'Pet profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Pet profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update pet profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pet profile' });
  }
};

export const handleGetUserPetProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const petProfiles = await petProfileFunctionController.getUserPetProfiles(userId);
    res.status(200).json({
      success: true,
      message: 'Pet profiles retrieved successfully',
      data: petProfiles
    });
  } catch (error) {
    console.error('Get user pet profiles error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pet profiles' });
  }
};

export const handleDeletePetProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId } = req.params;
    const deleted = await petProfileFunctionController.deletePetProfile(userId, petId);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Pet profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Pet profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete pet profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete pet profile' });
  }
};

export const handleUpdatePetAdoptableStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId } = req.params;
    const { isAdoptable } = req.body;

    if (isAdoptable === undefined) {
      res.status(400).json({ success: false, message: 'isAdoptable field is required' });
      return;
    }

    const updatedProfile = await petProfileFunctionController.updatePetProfile(userId, petId, { isAdoptable });

    if (!updatedProfile) {
      res.status(404).json({ success: false, message: 'Pet profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Pet adoptable status updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update pet adoptable status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pet adoptable status' });
  }
}; 