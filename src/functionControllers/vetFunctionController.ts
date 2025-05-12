import { PrismaClient, User, Clinic } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create a new clinic
export const createClinic = async (
  userId: string,
  data: {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    operatingHours?: string;
    profilePictureUrl?: string;
    coverPictureUrl?: string;
    address: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
    images?: string[]; // Array of image URLs
  }
): Promise<{
  success: boolean;
  message: string;
  data?: Partial<Clinic>;
}> => {
  try {
    // Check if user exists and is a VET
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (user.role !== 'VET') {
      return {
        success: false,
        message: 'Only veterinarians can create clinics'
      };
    }

    // Create the clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        operatingHours: data.operatingHours,
        profilePictureUrl: data.profilePictureUrl,
        coverPictureUrl: data.coverPictureUrl,
        verificationStatus: 'PENDING', // All new clinics start as pending
        ownerId: userId,
        // Create address
        address: {
          create: {
            address: data.address.address,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode
          }
        },
        // Create images if provided
        ...(data.images && data.images.length > 0
          ? {
              ClinicImage: {
                createMany: {
                  data: data.images.map(imageUrl => ({
                    imageUrl
                  }))
                }
              }
            }
          : {})
      },
      include: {
        address: true,
        ClinicImage: true
      }
    });

    return {
      success: true,
      message: 'Clinic created successfully',
      data: clinic
    };
  } catch (error) {
    console.error('Create clinic error:', error);
    return {
      success: false,
      message: 'Failed to create clinic'
    };
  }
};

// Function to get clinics owned by a vet
export const getVetClinics = async (userId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: {
        ownerId: userId
      },
      include: {
        address: true,
        ClinicImage: true
      }
    });

    return {
      success: true,
      message: 'Clinics retrieved successfully',
      data: clinics
    };
  } catch (error) {
    console.error('Get vet clinics error:', error);
    return {
      success: false,
      message: 'Failed to retrieve clinics'
    };
  }
};
