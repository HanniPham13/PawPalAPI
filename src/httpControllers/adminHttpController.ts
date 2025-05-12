import { Request, Response } from 'express';
import { adminLogin, getPendingVerifications, approveVerification, rejectVerification, createAdmin, registerVet, getPendingMedicalRecords, approveMedicalRecord, rejectMedicalRecord } from '../functionControllers/adminFunctionController';
import { AuthRequest } from '../middlewares/authMiddleware';

export const handleAdminLogin = async (req: Request, res: Response): Promise<void> => {
  // Check if body exists
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    return;
  }

  const result = await adminLogin(email, password);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(401).json(result);
  }
};

export const handleGetPendingVerifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await getPendingVerifications(page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get pending verifications' });
  }
};

export const handleApproveVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { verificationId } = req.params;

    if (!verificationId) {
      res.status(400).json({ success: false, message: 'Verification ID is required' });
      return;
    }

    const result = await approveVerification(verificationId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to approve verification' });
  }
};

export const handleRejectVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { verificationId } = req.params;
    const { reason } = req.body;

    if (!verificationId) {
      res.status(400).json({ success: false, message: 'Verification ID is required' });
      return;
    }

    if (!reason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }

    const result = await rejectVerification(verificationId, reason);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to reject verification' });
  }
};

export const handleCreateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username, secret } = req.body;

    // Require a secret key to create admin (for security)
    if (secret !== process.env.ADMIN_SECRET && secret !== 'admin_secret_for_testing') {
      res.status(403).json({ success: false, message: 'Invalid admin creation secret' });
      return;
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username) {
      res.status(400).json({ 
        success: false, 
        message: 'All fields (email, password, firstName, lastName, username) are required' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    const result = await createAdmin({
      email,
      password,
      firstName,
      lastName,
      username
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
};

export const handleRegisterVet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { email, password, firstName, lastName, username } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username) {
      res.status(400).json({ 
        success: false, 
        message: 'All fields (email, password, firstName, lastName, username) are required' 
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    const result = await registerVet({
      email,
      password,
      firstName,
      lastName,
      username
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to register vet user' });
  }
};

export const handleGetPendingVetDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    // This will work after running migrations to add the VetDocument model
    // const result = await getPendingVetDocuments(page, limit);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get pending vet documents' });
  }
};

export const handleApproveVetDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { documentId } = req.params;

    if (!documentId) {
      res.status(400).json({ success: false, message: 'Document ID is required' });
      return;
    }

    // This will work after running migrations to add the VetDocument model
    // const result = await approveVetDocument(documentId);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to approve vet document' });
  }
};

export const handleRejectVetDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { documentId } = req.params;
    const { reason } = req.body;

    if (!documentId) {
      res.status(400).json({ success: false, message: 'Document ID is required' });
      return;
    }

    if (!reason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }

    // This will work after running migrations to add the VetDocument model
    // const result = await rejectVetDocument(documentId, reason);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to reject vet document' });
  }
};

export const handleGetPendingMedicalRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    // This will work after running migrations to add the verification fields to MedicalRecord model
    // const result = await getPendingMedicalRecords(page, limit);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get pending medical records' });
  }
};

export const handleApproveMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { recordId } = req.params;

    if (!recordId) {
      res.status(400).json({ success: false, message: 'Medical record ID is required' });
      return;
    }

    // This will work after running migrations
    // const result = await approveMedicalRecord(recordId, req.user.id);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to approve medical record' });
  }
};

export const handleRejectMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
      return;
    }

    const { recordId } = req.params;
    const { reason } = req.body;

    if (!recordId) {
      res.status(400).json({ success: false, message: 'Medical record ID is required' });
      return;
    }

    if (!reason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }

    // This will work after running migrations
    // const result = await rejectMedicalRecord(recordId, req.user.id, reason);
    
    // Temporary placeholder response until migrations are run
    res.status(501).json({
      success: false,
      message: 'Feature not yet implemented - requires database migration'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to reject medical record' });
  }
};
