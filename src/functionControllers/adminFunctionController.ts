import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationApprovalEmail, sendVerificationRejectionEmail } from '../services/emailService';

const prisma = new PrismaClient();

export const adminLogin = async (email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  token?: string;
  user?: Partial<User>;
}> => {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Check if user email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: 'Please verify your email before logging in'
      };
    }

    // Check if user is an admin
    if (user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Admin access only.'
      };
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, verificationCode: __, ...userWithoutSensitiveInfo } = user;

    return {
      success: true,
      message: 'Admin login successful',
      token,
      user: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

export const getPendingVerifications = async (page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const verifications = await prisma.verificationDocument.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        VerificationDocumentFile: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = verifications.length > limit;
    const verificationsToReturn = hasMore ? verifications.slice(0, limit) : verifications;

    return {
      success: true,
      message: 'Pending verifications retrieved successfully',
      data: verificationsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get pending verifications error:', error);
    return {
      success: false,
      message: 'Failed to retrieve pending verifications',
      hasMore: false
    };
  }
};

export const approveVerification = async (verificationId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the verification document
    const verification = await prisma.verificationDocument.findUnique({
      where: { id: verificationId },
      include: { user: true }
    });

    if (!verification) {
      return {
        success: false,
        message: 'Verification document not found'
      };
    }

    // Allow approving if status is PENDING or REJECTED
    if (verification.status !== 'PENDING' && verification.status !== 'REJECTED') {
      return {
        success: false,
        message: `Verification already ${verification.status.toLowerCase()}`
      };
    }

    // Update verification status to APPROVED
    const updatedVerification = await prisma.verificationDocument.update({
      where: { id: verificationId },
      data: { 
        status: 'APPROVED',
        rejectionReason: verification.status === 'REJECTED' ? null : verification.rejectionReason // Clear rejection reason if it exists
      }
    });

    // Update user's verification level to PURRPARENT
    await prisma.user.update({
      where: { id: verification.userId },
      data: { verificationLevel: 'PURRPARENT' }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: verification.status === 'REJECTED' ? 
          'Good news! Your previously rejected verification request has been reconsidered and approved. You are now a PurrParent.' : 
          'Your verification request has been approved! You are now a PurrParent.',
        receiverId: verification.userId,
        senderId: verification.userId // Self notification since it's system-generated
      }
    });

    // Send approval email to the user
    await sendVerificationApprovalEmail(verification.user);

    return {
      success: true,
      message: verification.status === 'REJECTED' ? 
        'Verification status reversed from rejected to approved' : 
        'Verification approved successfully',
      data: updatedVerification
    };
  } catch (error) {
    console.error('Approve verification error:', error);
    return {
      success: false,
      message: 'Failed to approve verification'
    };
  }
};

export const rejectVerification = async (verificationId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the verification document
    const verification = await prisma.verificationDocument.findUnique({
      where: { id: verificationId },
      include: { user: true }
    });

    if (!verification) {
      return {
        success: false,
        message: 'Verification document not found'
      };
    }

    // Allow rejecting if status is PENDING or APPROVED
    if (verification.status !== 'PENDING' && verification.status !== 'APPROVED') {
      return {
        success: false,
        message: `Verification already ${verification.status.toLowerCase()}`
      };
    }

    // If the verification was previously approved, also update the user's verification level
    if (verification.status === 'APPROVED') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verificationLevel: 'VERIFIED' } // Reset to regular VERIFIED status
      });
    }

    // Update verification status to REJECTED
    const updatedVerification = await prisma.verificationDocument.update({
      where: { id: verificationId },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: `Your verification request has been rejected. Reason: ${reason}`,
        receiverId: verification.userId,
        senderId: verification.userId // Self notification since it's system-generated
      }
    });

    // Send rejection email to the user
    await sendVerificationRejectionEmail(verification.user, reason);

    return {
      success: true,
      message: verification.status === 'APPROVED' ? 
        'Verification status reversed from approved to rejected' : 
        'Verification rejected successfully',
      data: updatedVerification
    };
  } catch (error) {
    console.error('Reject verification error:', error);
    return {
      success: false,
      message: 'Failed to reject verification'
    };
  }
};

// New function to create an admin user
export const createAdmin = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (existingUsername) {
      return {
        success: false,
        message: 'Username already in use'
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        role: 'ADMIN',
        isEmailVerified: true, // Auto-verify admin accounts
        verificationLevel: 'VERIFIED', // Use VERIFIED instead of ADMIN
        profile: {
          create: {} // Create an empty profile
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        verificationLevel: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' } // Longer expiry for testing
    );

    return {
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: admin,
        token
      }
    };
  } catch (error) {
    console.error('Create admin error:', error);
    return {
      success: false,
      message: 'Failed to create admin user'
    };
  }
};

// Function to register a vet user by admin
export const registerVet = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (existingUsername) {
      return {
        success: false,
        message: 'Username already in use'
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create vet user
    const vet = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        role: 'VET',
        isEmailVerified: true, // Auto-verify vet accounts registered by admin
        verificationLevel: 'VET',
        profile: {
          create: {} // Create an empty profile
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        verificationLevel: true,
        createdAt: true
      }
    });

    return {
      success: true,
      message: 'Vet user registered successfully',
      data: {
        user: vet
      }
    };
  } catch (error) {
    console.error('Register vet error:', error);
    return {
      success: false,
      message: 'Failed to register vet user'
    };
  }
};

// Function to get all pending vet documents
export const getPendingVetDocuments = async (page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const vetDocuments = await prisma.vetDocument.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = vetDocuments.length > limit;
    const documentsToReturn = hasMore ? vetDocuments.slice(0, limit) : vetDocuments;

    return {
      success: true,
      message: 'Pending vet documents retrieved successfully',
      data: documentsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get pending vet documents error:', error);
    return {
      success: false,
      message: 'Failed to retrieve pending vet documents',
      hasMore: false
    };
  }
};

// Function to approve a vet document
export const approveVetDocument = async (documentId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the vet document
    const vetDocument = await prisma.vetDocument.findUnique({
      where: { id: documentId },
      include: { user: true }
    });

    if (!vetDocument) {
      return {
        success: false,
        message: 'Vet document not found'
      };
    }

    // Allow approving if status is PENDING or REJECTED
    if (vetDocument.status !== 'PENDING' && vetDocument.status !== 'REJECTED') {
      return {
        success: false,
        message: `Document already ${vetDocument.status.toLowerCase()}`
      };
    }

    // Update document status to APPROVED
    const updatedDocument = await prisma.vetDocument.update({
      where: { id: documentId },
      data: { 
        status: 'APPROVED',
        rejectionReason: vetDocument.status === 'REJECTED' ? null : vetDocument.rejectionReason // Clear rejection reason if it exists
      }
    });

    // If this is the first approved vet document, update user's role and verification level
    if (vetDocument.user.role !== 'VET') {
      await prisma.user.update({
        where: { id: vetDocument.userId },
        data: { 
          role: 'VET',
          verificationLevel: 'VET'
        }
      });
    }

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: vetDocument.status === 'REJECTED' ? 
          'Your previously rejected veterinary document has been reconsidered and approved.' : 
          'Your veterinary document has been approved!',
        receiverId: vetDocument.userId,
        senderId: vetDocument.userId // Self notification since it's system-generated
      }
    });

    return {
      success: true,
      message: vetDocument.status === 'REJECTED' ? 
        'Vet document status reversed from rejected to approved' : 
        'Vet document approved successfully',
      data: updatedDocument
    };
  } catch (error) {
    console.error('Approve vet document error:', error);
    return {
      success: false,
      message: 'Failed to approve vet document'
    };
  }
};

// Function to reject a vet document
export const rejectVetDocument = async (documentId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the vet document
    const vetDocument = await prisma.vetDocument.findUnique({
      where: { id: documentId },
      include: { user: true }
    });

    if (!vetDocument) {
      return {
        success: false,
        message: 'Vet document not found'
      };
    }

    // Allow rejecting if status is PENDING or APPROVED
    if (vetDocument.status !== 'PENDING' && vetDocument.status !== 'APPROVED') {
      return {
        success: false,
        message: `Document already ${vetDocument.status.toLowerCase()}`
      };
    }

    // Update document status to REJECTED
    const updatedDocument = await prisma.vetDocument.update({
      where: { id: documentId },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: `Your veterinary document has been rejected. Reason: ${reason}`,
        receiverId: vetDocument.userId,
        senderId: vetDocument.userId // Self notification since it's system-generated
      }
    });

    return {
      success: true,
      message: vetDocument.status === 'APPROVED' ? 
        'Vet document status reversed from approved to rejected' : 
        'Vet document rejected successfully',
      data: updatedDocument
    };
  } catch (error) {
    console.error('Reject vet document error:', error);
    return {
      success: false,
      message: 'Failed to reject vet document'
    };
  }
};

// Function to get pending medical records
export const getPendingMedicalRecords = async (page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        verificationStatus: 'PENDING'
      },
      include: {
        petProfile: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            profilePicture: true,
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                profile: {
                  select: {
                    profilePictureUrl: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = medicalRecords.length > limit;
    const recordsToReturn = hasMore ? medicalRecords.slice(0, limit) : medicalRecords;

    return {
      success: true,
      message: 'Pending medical records retrieved successfully',
      data: recordsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get pending medical records error:', error);
    return {
      success: false,
      message: 'Failed to retrieve pending medical records',
      hasMore: false
    };
  }
};

// Function to approve a medical record
export const approveMedicalRecord = async (recordId: string, adminId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the medical record
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: { 
        petProfile: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!medicalRecord) {
      return {
        success: false,
        message: 'Medical record not found'
      };
    }

    // Allow approving if status is PENDING or REJECTED
    if (medicalRecord.verificationStatus !== 'PENDING' && medicalRecord.verificationStatus !== 'REJECTED') {
      return {
        success: false,
        message: `Medical record already ${medicalRecord.verificationStatus.toLowerCase()}`
      };
    }

    // Update medical record status to APPROVED
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: { 
        verificationStatus: 'APPROVED',
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: null // Clear rejection reason if it exists
      }
    });

    // Create notification for the pet owner
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: medicalRecord.verificationStatus === 'REJECTED' ? 
          `Your previously rejected medical record for ${medicalRecord.petProfile.name} has been reconsidered and approved.` : 
          `Your medical record for ${medicalRecord.petProfile.name} has been approved.`,
        receiverId: medicalRecord.petProfile.owner.id,
        senderId: adminId
      }
    });

    return {
      success: true,
      message: medicalRecord.verificationStatus === 'REJECTED' ? 
        'Medical record status reversed from rejected to approved' : 
        'Medical record approved successfully',
      data: updatedRecord
    };
  } catch (error) {
    console.error('Approve medical record error:', error);
    return {
      success: false,
      message: 'Failed to approve medical record'
    };
  }
};

// Function to reject a medical record
export const rejectMedicalRecord = async (recordId: string, adminId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the medical record
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: { 
        petProfile: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!medicalRecord) {
      return {
        success: false,
        message: 'Medical record not found'
      };
    }

    // Allow rejecting if status is PENDING or APPROVED
    if (medicalRecord.verificationStatus !== 'PENDING' && medicalRecord.verificationStatus !== 'APPROVED') {
      return {
        success: false,
        message: `Medical record already ${medicalRecord.verificationStatus.toLowerCase()}`
      };
    }

    // Update medical record status to REJECTED
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: { 
        verificationStatus: 'REJECTED',
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason
      }
    });

    // Create notification for the pet owner
    await prisma.notification.create({
      data: {
        type: 'VERIFICATION',
        message: `Your medical record for ${medicalRecord.petProfile.name} has been rejected. Reason: ${reason}`,
        receiverId: medicalRecord.petProfile.owner.id,
        senderId: adminId
      }
    });

    return {
      success: true,
      message: medicalRecord.verificationStatus === 'APPROVED' ? 
        'Medical record status reversed from approved to rejected' : 
        'Medical record rejected successfully',
      data: updatedRecord
    };
  } catch (error) {
    console.error('Reject medical record error:', error);
    return {
      success: false,
      message: 'Failed to reject medical record'
    };
  }
};
