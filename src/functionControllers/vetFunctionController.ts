import { PrismaClient } from "@prisma/client";
import { ClinicData } from "../types/clinic";

const prisma = new PrismaClient();

// Create a new clinic
export const createClinic = async (ownerId: string, data: ClinicData) => {
  try {
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
        ownerId,
        verificationStatus: "PENDING",
        address: {
          create: {
            address: data.address.address,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
          },
        },
        ...(data.images && data.images.length > 0
          ? {
              ClinicImage: {
                createMany: {
                  data: data.images.map((imageUrl) => ({
                    imageUrl,
                  })),
                },
              },
            }
          : {}),
      },
      include: {
        address: true,
        ClinicImage: true,
      },
    });

    return {
      success: true,
      message: "Clinic created successfully",
      data: clinic,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create clinic",
    };
  }
};

// Get all clinics for a vet
export const getVetClinics = async (ownerId: string) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: {
        ownerId,
      },
      include: {
        address: true,
        ClinicImage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: clinics,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrieve clinics",
    };
  }
};

// Get a specific clinic by ID
export const getClinicById = async (ownerId: string, clinicId: string) => {
  try {
    const clinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        ownerId,
      },
      include: {
        address: true,
        ClinicImage: true,
      },
    });

    if (!clinic) {
      return {
        success: false,
        message: "Clinic not found",
      };
    }

    return {
      success: true,
      data: clinic,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrieve clinic",
    };
  }
};

// Update clinic details
export const updateClinic = async (
  ownerId: string,
  clinicId: string,
  data: Partial<ClinicData>
) => {
  try {
    // Check if clinic exists and belongs to the vet
    const existingClinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        ownerId,
      },
    });

    if (!existingClinic) {
      return {
        success: false,
        message: "Clinic not found or unauthorized",
      };
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      description: data.description,
      phone: data.phone,
      email: data.email,
      website: data.website,
      operatingHours: data.operatingHours,
      profilePictureUrl: data.profilePictureUrl,
      coverPictureUrl: data.coverPictureUrl,
    };

    // Handle address update if provided
    if (data.address) {
      updateData.address = {
        update: {
          where: {
            clinicId,
          },
          data: {
            address: data.address.address,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
          },
        },
      };
    }

    // Handle clinic images if provided
    if (data.images && data.images.length > 0) {
      updateData.ClinicImage = {
        createMany: {
          data: data.images.map((imageUrl) => ({
            imageUrl,
          })),
        },
      };
    }

    const updatedClinic = await prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data: updateData,
      include: {
        address: true,
        ClinicImage: true,
      },
    });

    return {
      success: true,
      message: "Clinic updated successfully",
      data: updatedClinic,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update clinic",
    };
  }
};

// Update clinic verification status
export const updateClinicStatus = async (
  ownerId: string,
  clinicId: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
) => {
  try {
    // Check if clinic exists and belongs to the vet
    const existingClinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        ownerId,
      },
    });

    if (!existingClinic) {
      return {
        success: false,
        message: "Clinic not found or unauthorized",
      };
    }

    const updatedClinic = await prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data: {
        verificationStatus: status,
      },
      include: {
        address: true,
        ClinicImage: true,
      },
    });

    return {
      success: true,
      message: "Clinic status updated successfully",
      data: updatedClinic,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update clinic status",
    };
  }
};

// Delete a clinic
export const deleteClinic = async (ownerId: string, clinicId: string) => {
  try {
    // Check if clinic exists and belongs to the vet
    const existingClinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        ownerId,
      },
    });

    if (!existingClinic) {
      return {
        success: false,
        message: "Clinic not found or unauthorized",
      };
    }

    await prisma.clinic.delete({
      where: {
        id: clinicId,
      },
    });

    return {
      success: true,
      message: "Clinic deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete clinic",
    };
  }
};
