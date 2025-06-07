import { Request, Response } from "express";
import {
  createClinic,
  getVetClinics,
  updateClinic,
  deleteClinic,
  getClinicById,
  updateClinicStatus,
} from "../functionControllers/vetFunctionController";
import { AuthRequest } from "../middlewares/authMiddleware";

// Handler to create a new clinic
export const handleCreateClinic = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is a vet
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const {
      name,
      description,
      phone,
      email,
      website,
      operatingHours,
      address,
    } = req.body;

    // Validate required fields
    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Clinic name is required" });
      return;
    }

    if (
      !address ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      res
        .status(400)
        .json({ success: false, message: "Complete address is required" });
      return;
    }

    // Get profile and cover picture URLs if uploaded
    let profilePictureUrl: string | undefined;
    let coverPictureUrl: string | undefined;

    if (req.files) {
      // Handle both array of files and single files (multer types)
      const filesArray = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      filesArray.forEach((file: Express.Multer.File) => {
        // Convert local path to URL path
        const imagePath = file.path.replace(/\\/g, "/");

        if (file.fieldname === "profilePicture") {
          profilePictureUrl = imagePath;
        } else if (file.fieldname === "coverPicture") {
          coverPictureUrl = imagePath;
        } else if (file.fieldname === "clinicImages") {
          // For other clinic images
          if (!req.body.images) {
            req.body.images = [];
          }
          req.body.images.push(imagePath);
        }
      });
    }

    // Get additional clinic images if any
    const images: string[] = req.body.images || [];

    const result = await createClinic(req.user!.id, {
      name,
      description,
      phone,
      email,
      website,
      operatingHours,
      profilePictureUrl,
      coverPictureUrl,
      address,
      images,
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
    res
      .status(500)
      .json({ success: false, message: "Failed to create clinic" });
  }
};

// Handler to get vet's clinics
export const handleGetVetClinics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is a vet
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const result = await getVetClinics(req.user.id);

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
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve clinics" });
  }
};

// Handler to get a specific clinic by ID
export const handleGetClinicById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const clinicId = req.params.id;
    const result = await getClinicById(req.user.id, clinicId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve clinic" });
  }
};

// Handler to update clinic details
export const handleUpdateClinic = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const clinicId = req.params.id;
    const updateData = { ...req.body };

    // Handle file uploads similar to create
    if (req.files) {
      const filesArray = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      filesArray.forEach((file: Express.Multer.File) => {
        const imagePath = file.path.replace(/\\/g, "/");

        if (file.fieldname === "profilePicture") {
          updateData.profilePictureUrl = imagePath;
        } else if (file.fieldname === "coverPicture") {
          updateData.coverPictureUrl = imagePath;
        } else if (file.fieldname === "clinicImages") {
          if (!updateData.images) {
            updateData.images = [];
          }
          updateData.images.push(imagePath);
        }
      });
    }

    const result = await updateClinic(req.user.id, clinicId, updateData);

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
    res
      .status(500)
      .json({ success: false, message: "Failed to update clinic" });
  }
};

// Handler to update clinic status
export const handleUpdateClinicStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const clinicId = req.params.id;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }

    const result = await updateClinicStatus(req.user.id, clinicId, status);

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
    res
      .status(500)
      .json({ success: false, message: "Failed to update clinic status" });
  }
};

// Handler to delete a clinic
export const handleDeleteClinic = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "VET") {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized. Vet access only." });
      return;
    }

    const clinicId = req.params.id;
    const result = await deleteClinic(req.user.id, clinicId);

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
    res
      .status(500)
      .json({ success: false, message: "Failed to delete clinic" });
  }
};
