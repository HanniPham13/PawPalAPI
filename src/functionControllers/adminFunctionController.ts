import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendVerificationApprovalEmail,
  sendVerificationRejectionEmail,
} from "../services/emailService";

const prisma = new PrismaClient();

export const adminLogin = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<User>;
}> => {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    // Check if user email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in",
      };
    }

    // Check if user is an admin
    if (user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized. Admin access only.",
      };
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    // Return user data without password
    const {
      password: _,
      verificationCode: __,
      ...userWithoutSensitiveInfo
    } = user;

    return {
      success: true,
      message: "Admin login successful",
      token,
      user: userWithoutSensitiveInfo,
    };
  } catch (error) {
    console.error("Admin login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
    };
  }
};

export const getPendingVerifications = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const verifications = await prisma.verificationDocument.findMany({
      where: {
        status: "PENDING",
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
                profilePictureUrl: true,
              },
            },
          },
        },
        VerificationDocumentFile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit + 1,
    });

    const hasMore = verifications.length > limit;
    const verificationsToReturn = hasMore
      ? verifications.slice(0, limit)
      : verifications;

    return {
      success: true,
      message: "Pending verifications retrieved successfully",
      data: verificationsToReturn,
      hasMore,
    };
  } catch (error) {
    console.error("Get pending verifications error:", error);
    return {
      success: false,
      message: "Failed to retrieve pending verifications",
      hasMore: false,
    };
  }
};

export const approveVerification = async (
  verificationId: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the verification document
    const verification = await prisma.verificationDocument.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verification) {
      return {
        success: false,
        message: "Verification document not found",
      };
    }

    // Allow approving if status is PENDING or REJECTED
    if (
      verification.status !== "PENDING" &&
      verification.status !== "REJECTED"
    ) {
      return {
        success: false,
        message: `Verification already ${verification.status.toLowerCase()}`,
      };
    }

    // Update verification status to APPROVED
    const updatedVerification = await prisma.verificationDocument.update({
      where: { id: verificationId },
      data: {
        status: "APPROVED",
        rejectionReason:
          verification.status === "REJECTED"
            ? null
            : verification.rejectionReason, // Clear rejection reason if it exists
      },
    });

    // Update user's verification level to PURRPARENT
    await prisma.user.update({
      where: { id: verification.userId },
      data: { verificationLevel: "PURRPARENT" },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: "VERIFICATION",
        message:
          verification.status === "REJECTED"
            ? "Good news! Your previously rejected verification request has been reconsidered and approved. You are now a PurrParent."
            : "Your verification request has been approved! You are now a PurrParent.",
        receiverId: verification.userId,
        senderId: verification.userId, // Self notification since it's system-generated
      },
    });

    // Send approval email to the user
    await sendVerificationApprovalEmail(verification.user);

    return {
      success: true,
      message:
        verification.status === "REJECTED"
          ? "Verification status reversed from rejected to approved"
          : "Verification approved successfully",
      data: updatedVerification,
    };
  } catch (error) {
    console.error("Approve verification error:", error);
    return {
      success: false,
      message: "Failed to approve verification",
    };
  }
};

export const rejectVerification = async (
  verificationId: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // Get the verification document
    const verification = await prisma.verificationDocument.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verification) {
      return {
        success: false,
        message: "Verification document not found",
      };
    }

    // Allow rejecting if status is PENDING or APPROVED
    if (
      verification.status !== "PENDING" &&
      verification.status !== "APPROVED"
    ) {
      return {
        success: false,
        message: `Verification already ${verification.status.toLowerCase()}`,
      };
    }

    // If the verification was previously approved, also update the user's verification level
    if (verification.status === "APPROVED") {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verificationLevel: "VERIFIED" }, // Reset to regular VERIFIED status
      });
    }

    // Update verification status to REJECTED
    const updatedVerification = await prisma.verificationDocument.update({
      where: { id: verificationId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: "VERIFICATION",
        message: `Your verification request has been rejected. Reason: ${reason}`,
        receiverId: verification.userId,
        senderId: verification.userId, // Self notification since it's system-generated
      },
    });

    // Send rejection email to the user
    await sendVerificationRejectionEmail(verification.user, reason);

    return {
      success: true,
      message:
        verification.status === "APPROVED"
          ? "Verification status reversed from approved to rejected"
          : "Verification rejected successfully",
      data: updatedVerification,
    };
  } catch (error) {
    console.error("Reject verification error:", error);
    return {
      success: false,
      message: "Failed to reject verification",
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
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return {
        success: false,
        message: "Username already in use",
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
        role: "ADMIN",
        isEmailVerified: true, // Auto-verify admin accounts
        verificationLevel: "VERIFIED", // Use VERIFIED instead of ADMIN
        profile: {
          create: {}, // Create an empty profile
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        verificationLevel: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" } // Longer expiry for testing
    );

    return {
      success: true,
      message: "Admin user created successfully",
      data: {
        user: admin,
        token,
      },
    };
  } catch (error) {
    console.error("Create admin error:", error);
    return {
      success: false,
      message: "Failed to create admin user",
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
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return {
        success: false,
        message: "Username already in use",
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
        role: "VET",
        isEmailVerified: true, // Auto-verify vet accounts registered by admin
        verificationLevel: "VET",
        profile: {
          create: {}, // Create an empty profile
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        verificationLevel: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Vet user registered successfully",
      data: {
        user: vet,
      },
    };
  } catch (error) {
    console.error("Register vet error:", error);
    return {
      success: false,
      message: "Failed to register vet user",
    };
  }
};

export const getPendingVetDocuments = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const pendingDocuments = await prisma.vetDocument.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: {
              select: {
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.vetDocument.count({
      where: {
        status: "PENDING",
      },
    });

    return {
      success: true,
      data: {
        documents: pendingDocuments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error getting pending vet documents:", error);
    return { success: false, message: "Failed to get pending vet documents" };
  }
};

export const approveVetDocument = async (documentId: string) => {
  try {
    const document = await prisma.vetDocument.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Update user's verification level to VET
    await prisma.user.update({
      where: { id: document.userId },
      data: {
        verificationLevel: "VET",
        role: "VET",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "VERIFICATION",
        message:
          "Your vet documents have been approved! You now have vet privileges.",
        receiverId: document.userId,
      },
    });

    return { success: true, message: "Vet document approved successfully" };
  } catch (error) {
    console.error("Error approving vet document:", error);
    return { success: false, message: "Failed to approve vet document" };
  }
};

export const rejectVetDocument = async (documentId: string, reason: string) => {
  try {
    const document = await prisma.vetDocument.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
      include: {
        user: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "VERIFICATION",
        message: `Your vet documents were rejected. Reason: ${reason}`,
        receiverId: document.userId,
      },
    });

    return { success: true, message: "Vet document rejected successfully" };
  } catch (error) {
    console.error("Error rejecting vet document:", error);
    return { success: false, message: "Failed to reject vet document" };
  }
};

export const getPendingMedicalRecords = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const pendingRecords = await prisma.medicalRecord.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      include: {
        petProfile: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: {
                  select: {
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.medicalRecord.count({
      where: {
        verificationStatus: "PENDING",
      },
    });

    return {
      success: true,
      data: {
        records: pendingRecords,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error getting pending medical records:", error);
    return { success: false, message: "Failed to get pending medical records" };
  }
};

export const approveMedicalRecord = async (recordId: string) => {
  try {
    const record = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        verificationStatus: "APPROVED",
        updatedAt: new Date(),
      },
      include: {
        petProfile: {
          include: {
            owner: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "SYSTEM",
        message: `Medical record for ${record.petProfile.name} has been approved!`,
        receiverId: record.petProfile.ownerId,
      },
    });

    return { success: true, message: "Medical record approved successfully" };
  } catch (error) {
    console.error("Error approving medical record:", error);
    return { success: false, message: "Failed to approve medical record" };
  }
};

export const rejectMedicalRecord = async (recordId: string, reason: string) => {
  try {
    const record = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        verificationStatus: "REJECTED",
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      include: {
        petProfile: {
          include: {
            owner: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "SYSTEM",
        message: `Medical record for ${record.petProfile.name} was rejected. Reason: ${reason}`,
        receiverId: record.petProfile.ownerId,
      },
    });

    return { success: true, message: "Medical record rejected successfully" };
  } catch (error) {
    console.error("Error rejecting medical record:", error);
    return { success: false, message: "Failed to reject medical record" };
  }
};
