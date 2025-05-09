import { Request, Response } from 'express';
import { PetSpecies, PetGender, PetSize } from '@prisma/client';
import { 
  createPetProfile, 
  getPetProfile, 
  updatePetProfile, 
  deletePetProfile, 
  getUserPets,
  toggleAdoptableStatus,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecords,
  getMedicalRecord
} from '../functionControllers/petFunctionController';
import { AuthRequest } from '../middlewares/authMiddleware';
import fs from 'fs';

// Helper to validate enum values
const isValidEnum = (value: any, enumObj: object): boolean => {
  return Object.values(enumObj).includes(value);
};

export const handleCreatePetProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { name, species, breed, age, gender, size, color, description, isAdoptable } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    // Validate required fields
    if (!name || !species) {
      res.status(400).json({ success: false, message: 'Pet name and species are required' });
      return;
    }

    // Validate species enum
    if (!isValidEnum(species, PetSpecies)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid species. Must be one of: ${Object.values(PetSpecies).join(', ')}` 
      });
      return;
    }

    // Validate gender enum if provided
    if (gender && !isValidEnum(gender, PetGender)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid gender. Must be one of: ${Object.values(PetGender).join(', ')}` 
      });
      return;
    }

    // Validate size enum if provided
    if (size && !isValidEnum(size, PetSize)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid size. Must be one of: ${Object.values(PetSize).join(', ')}` 
      });
      return;
    }

    // Validate age if provided
    if (age !== undefined && (isNaN(Number(age)) || Number(age) < 0)) {
      res.status(400).json({ success: false, message: 'Age must be a positive number' });
      return;
    }

    // Create pet profile
    const result = await createPetProfile(userId, {
      name,
      species,
      breed,
      age: age !== undefined ? Number(age) : undefined,
      gender,
      size,
      color,
      description,
      isAdoptable: isAdoptable === true || isAdoptable === 'true',
      profilePicture
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleCreatePetProfile:', error);
    res.status(500).json({ success: false, message: 'Server error while creating pet profile' });
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
    
    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const { name, species, breed, age, gender, size, color, description, isAdoptable } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    // Validate input fields if provided
    if (species && !isValidEnum(species, PetSpecies)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid species. Must be one of: ${Object.values(PetSpecies).join(', ')}` 
      });
      return;
    }

    if (gender && !isValidEnum(gender, PetGender)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid gender. Must be one of: ${Object.values(PetGender).join(', ')}` 
      });
      return;
    }

    if (size && !isValidEnum(size, PetSize)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid size. Must be one of: ${Object.values(PetSize).join(', ')}` 
      });
      return;
    }

    if (age !== undefined && (isNaN(Number(age)) || Number(age) < 0)) {
      res.status(400).json({ success: false, message: 'Age must be a positive number' });
      return;
    }

    const updateData = {
      ...(name && { name }),
      ...(species && { species }),
      ...(breed !== undefined && { breed }),
      ...(age !== undefined && { age: Number(age) }),
      ...(gender && { gender }),
      ...(size && { size }),
      ...(color !== undefined && { color }),
      ...(description !== undefined && { description }),
      ...(isAdoptable !== undefined && { isAdoptable: isAdoptable === true || isAdoptable === 'true' }),
      ...(profilePicture && { profilePicture })
    };

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'No update data provided' });
      return;
    }

    const result = await updatePetProfile(petId, userId, updateData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleUpdatePetProfile:', error);
    res.status(500).json({ success: false, message: 'Server error while updating pet profile' });
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
    
    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const result = await deletePetProfile(petId, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleDeletePetProfile:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting pet profile' });
  }
};

export const handleGetPetProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;

    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const result = await getPetProfile(petId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleGetPetProfile:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving pet profile' });
  }
};

export const handleGetUserPets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID is required' });
      return;
    }

    const result = await getUserPets(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleGetUserPets:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving user pets' });
  }
};

export const handleToggleAdoptableStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId } = req.params;
    
    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const result = await toggleAdoptableStatus(petId, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleToggleAdoptableStatus:', error);
    res.status(500).json({ success: false, message: 'Server error while updating pet adoption status' });
  }
};

// Medical Record Handler Functions

export const handleAddMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId } = req.params;
    
    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const { title, description, date } = req.body;
    const documentUrl = req.file ? req.file.path : undefined;

    // Validate required fields
    if (!title || !description || !date) {
      res.status(400).json({ success: false, message: 'Title, description and date are required' });
      return;
    }

    // Validate date format
    const recordDate = new Date(date);
    if (isNaN(recordDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date format' });
      return;
    }

    const result = await addMedicalRecord(petId, userId, {
      title,
      description,
      date: recordDate,
      documentUrl
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleAddMedicalRecord:', error);
    res.status(500).json({ success: false, message: 'Server error while adding medical record' });
  }
};

export const handleUpdateMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId, recordId } = req.params;
    
    if (!petId || !recordId) {
      res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
      return;
    }

    const { title, description, date } = req.body;
    const documentUrl = req.file ? req.file.path : undefined;

    // Prepare update data with only provided fields
    const updateData: any = {};
    
    if (title !== undefined) {
      updateData.title = title;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (date) {
      const recordDate = new Date(date);
      if (isNaN(recordDate.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid date format' });
        return;
      }
      updateData.date = recordDate;
    }
    
    if (documentUrl) {
      updateData.documentUrl = documentUrl;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'No update data provided' });
      return;
    }

    const result = await updateMedicalRecord(recordId, petId, userId, updateData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleUpdateMedicalRecord:', error);
    res.status(500).json({ success: false, message: 'Server error while updating medical record' });
  }
};

export const handleDeleteMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { petId, recordId } = req.params;
    
    if (!petId || !recordId) {
      res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
      return;
    }

    const result = await deleteMedicalRecord(recordId, petId, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleDeleteMedicalRecord:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting medical record' });
  }
};

export const handleGetMedicalRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    
    if (!petId) {
      res.status(400).json({ success: false, message: 'Pet ID is required' });
      return;
    }

    const result = await getMedicalRecords(petId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleGetMedicalRecords:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving medical records' });
  }
};

export const handleGetMedicalRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId, recordId } = req.params;
    
    if (!petId || !recordId) {
      res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
      return;
    }

    const result = await getMedicalRecord(recordId, petId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in handleGetMedicalRecord:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving medical record' });
  }
};
