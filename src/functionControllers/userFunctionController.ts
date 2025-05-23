import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const uploadProfilePicture = async (userId: string, filePath: string) => {
  try {
    // Delete old profile picture if exists
    const oldProfile = await prisma.profile.findFirst({
      where: { userId }
    });

    if (oldProfile?.profilePictureUrl) {
      const oldPath = path.join(process.cwd(), oldProfile.profilePictureUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Create or update profile picture
    const profile = await prisma.profile.upsert({
      where: { id: oldProfile?.id || '' },
      update: { profilePictureUrl: filePath },
      create: {
        userId,
        profilePictureUrl: filePath
      }
    });

    return { success: true, data: profile };
  } catch (error) {
    throw new Error('Failed to upload profile picture');
  }
};

export const uploadCoverPicture = async (userId: string, filePath: string) => {
  try {
    // Delete old cover picture if exists
    const oldCover = await prisma.coverPicture.findFirst({
      where: { userId }
    });

    if (oldCover?.coverPictureUrl) {
      const oldPath = path.join(process.cwd(), oldCover.coverPictureUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Create or update cover picture
    const cover = await prisma.coverPicture.upsert({
      where: { id: oldCover?.id || '' },
      update: { coverPictureUrl: filePath },
      create: {
        userId,
        coverPictureUrl: filePath
      }
    });

    return { success: true, data: cover };
  } catch (error) {
    throw new Error('Failed to upload cover picture');
  }
};

export const deleteProfilePicture = async (userId: string) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { userId }
    });

    if (profile?.profilePictureUrl) {
      const filePath = path.join(process.cwd(), profile.profilePictureUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await prisma.profile.update({
        where: { id: profile.id },
        data: { profilePictureUrl: null }
      });
    }

    return { success: true, message: 'Profile picture deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete profile picture');
  }
};

export const deleteCoverPicture = async (userId: string) => {
  try {
    const cover = await prisma.coverPicture.findFirst({
      where: { userId }
    });

    if (cover?.coverPictureUrl) {
      const filePath = path.join(process.cwd(), cover.coverPictureUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await prisma.coverPicture.update({
        where: { id: cover.id },
        data: { coverPictureUrl: null }
      });
    }

    return { success: true, message: 'Cover picture deleted successfully' };
  } catch (error) {
    throw new Error('Failed to delete cover picture');
  }
};

export const updateProfileInfo = async (userId: string, data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  username?: string;
}) => {
  try {
    // Check if username is being changed and if it's already taken
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
  data: {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        username: data.username
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        email: true,
        isVerified: true,
        verificationLevel: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to update profile information');
  }
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  try {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to change password');
  }
};

export const updateAddress = async (userId: string, addressData: {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  try {
    // Find existing address
    const existingAddress = await prisma.fullAddress.findFirst({
      where: { userId }
    });

    let address;
    if (existingAddress) {
      // Update existing address
      address = await prisma.fullAddress.update({
        where: { id: existingAddress.id },
        data: {
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode
        }
      });
    } else {
      // Create new address
      address = await prisma.fullAddress.create({
        data: {
          ...addressData,
          userId
        }
      });
    }

    return { success: true, data: address };
  } catch (error) {
    throw new Error('Failed to update address');
  }
};

export const createSocialPost = async (userId: string, data: {
  content: string;
  images?: string[];
  taggedPetIds?: string[];
}) => {
  try {
    // Verify that all tagged pets exist and belong to the user
    if (data.taggedPetIds && data.taggedPetIds.length > 0) {
      const taggedPets = await prisma.petProfile.findMany({
        where: {
          id: { in: data.taggedPetIds },
          ownerId: userId
        }
      });

      if (taggedPets.length !== data.taggedPetIds.length) {
        throw new Error('One or more tagged pets not found or don\'t belong to you');
      }
    }

    // Create the post with images
    const post = await prisma.socialPost.create({
      data: {
        content: data.content,
        authorId: userId,
        taggedPets: data.taggedPetIds ? {
          connect: data.taggedPetIds.map(id => ({ id }))
        } : undefined,
        SocialPostImage: data.images ? {
          create: data.images.map(imageUrl => ({
            imageUrl
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            },
            followers: {
              select: {
                followerId: true
              }
            }
          }
        },
        taggedPets: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        SocialPostImage: true,
        _count: {
          select: {
            reactions: true,
            comments: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
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
          }
        }
      }
    });

    // Calculate if the post author is being followed by the current user
    const isFollowing = post.author.followers.some(follower => follower.followerId === userId);

    // Add isFollowing flag to the response
    const postWithFollowingStatus = {
      ...post,
      isFollowing,
      isVerified: ['VERIFIED', 'PURRPARENT', 'SUPER_ADOPTER', 'VET'].includes(post.author.verificationLevel)
    };

    return { success: true, data: postWithFollowingStatus };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create social post');
  }
};

export const deleteSocialPost = async (userId: string, postId: string) => {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.socialPost.findFirst({
      where: {
        id: postId,
        authorId: userId
      },
      include: {
        SocialPostImage: true
      }
    });

    if (!post) {
      throw new Error('Post not found or you don\'t have permission to delete it');
    }

    // Delete associated images
    for (const image of post.SocialPostImage) {
      const imagePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the post (this will cascade delete the images in the database)
    await prisma.socialPost.delete({
      where: { id: postId }
    });

    return { success: true, message: 'Post deleted successfully' };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to delete social post');
  }
};

export const getSocialPost = async (postId: string) => {
  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        taggedPets: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        SocialPostImage: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
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
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return { success: true, data: post };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to get social post');
  }
};

export const applyForPurrparentVerification = async (userId: string, documents: {
  documentType: 'ID_CARD' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'PROOF_OF_ADDRESS' | 'VET_LICENSE' | 'PET_MEDICAL_RECORD' | 'ADOPTION_FORM' | 'OTHER';
  documentUrl: string;
}[]) => {
  try {
    // Check if user already has a pending verification
    const existingVerification = await prisma.verificationDocument.findFirst({
      where: {
        userId,
        status: 'PENDING'
      }
    });

    if (existingVerification) {
      throw new Error('You already have a pending verification request');
    }

    // Create single verification document with multiple files
    const verificationDoc = await prisma.verificationDocument.create({
      data: {
          userId,
        documentType: documents[0].documentType, // Use the first document type as the main type
        status: 'PENDING',
        VerificationDocumentFile: {
          create: documents.map(doc => ({
            documentUrl: doc.documentUrl
          }))
        }
      },
      include: {
        VerificationDocumentFile: true
      }
    });

    // Find an admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (adminUser) {
      // Create notification for admin
      await prisma.notification.create({
        data: {
          type: 'VERIFICATION',
          message: 'New purrparent verification request received',
          receiverId: adminUser.id,
          senderId: userId
        }
      });
    }

    return {
      success: true,
      message: 'Purrparent verification request submitted successfully',
      data: verificationDoc
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to submit purrparent verification request');
  }
};

export const createPetAdoptionPost = async (userId: string, data: {
  title: string;
  description: string;
  location?: string;
  petProfileId?: string;
  images?: string[];
}): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Verify that the pet exists and belongs to the user if petProfileId is provided
    if (data.petProfileId) {
      const petProfile = await prisma.petProfile.findFirst({
        where: {
          id: data.petProfileId,
          ownerId: userId
        }
      });

      if (!petProfile) {
        throw new Error('Pet not found or you don\'t have permission to create an adoption post for this pet');
      }

      // Update pet to mark as adoptable
      await prisma.petProfile.update({
        where: { id: data.petProfileId },
        data: { isAdoptable: true }
      });
    }

    // Create the adoption post with images
    let adoptionPost;
    
    if (data.images && data.images.length > 0) {
      // First create the post
      const createData: any = {
        title: data.title,
        description: data.description,
        location: data.location,
        authorId: userId
      };
      
      // Only add petProfileId if it exists
      if (data.petProfileId) {
        createData.petProfileId = data.petProfileId;
      }
      
      adoptionPost = await prisma.petAdoptionPost.create({
        data: createData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verificationLevel: true,
              profile: {
                select: {
                  profilePictureUrl: true
                }
              }
            }
          },
          petProfile: data.petProfileId ? {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              age: true,
              gender: true,
              size: true,
              color: true,
              description: true,
              profilePicture: true
            }
          } : false
        }
      });
      
      // Then create images separately
      for (const imageUrl of data.images) {
        await prisma.petAdoptionPostImage.create({
          data: {
            imageUrl,
            petAdoptionPostId: adoptionPost.id
          }
        });
      }
      
      // Fetch the post again with images
      adoptionPost = await prisma.petAdoptionPost.findUnique({
        where: { id: adoptionPost.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verificationLevel: true,
              profile: {
                select: {
                  profilePictureUrl: true
                }
              }
            }
          },
          petProfile: data.petProfileId ? {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              age: true,
              gender: true,
              size: true,
              color: true,
              description: true,
              profilePicture: true
            }
          } : false,
          PetAdoptionPostImage: true
        }
      });
    } else {
      // Create post without images
      const createData: any = {
        title: data.title,
        description: data.description,
        location: data.location,
        authorId: userId
      };
      
      // Only add petProfileId if it exists
      if (data.petProfileId) {
        createData.petProfileId = data.petProfileId;
      }
      
      adoptionPost = await prisma.petAdoptionPost.create({
        data: createData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verificationLevel: true,
              profile: {
                select: {
                  profilePictureUrl: true
                }
              }
            }
          },
          petProfile: data.petProfileId ? {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              age: true,
              gender: true,
              size: true,
              color: true,
              description: true,
              profilePicture: true
            }
          } : false,
          PetAdoptionPostImage: true
        }
      });
    }

    return {
      success: true,
      message: 'Pet adoption post created successfully',
      data: adoptionPost
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create pet adoption post');
  }
};

export const getUserAdoptionPosts = async (userId: string, page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const adoptionPosts = await prisma.petAdoptionPost.findMany({
      where: {
        authorId: userId
      },
      include: {
        petProfile: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            gender: true,
            size: true,
            color: true,
            profilePicture: true
          }
        },
        PetAdoptionPostImage: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = adoptionPosts.length > limit;
    const postsToReturn = hasMore ? adoptionPosts.slice(0, limit) : adoptionPosts;

    return {
      success: true,
      message: 'Adoption posts retrieved successfully',
      data: postsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get user adoption posts error:', error);
    return {
      success: false,
      message: 'Failed to get adoption posts',
      hasMore: false
    };
  }
};

export const deletePetAdoptionPost = async (userId: string, postId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.petAdoptionPost.findFirst({
      where: {
        id: postId,
        authorId: userId
      },
      include: {
        PetAdoptionPostImage: true,
        petProfile: true
      }
    });

    if (!post) {
      throw new Error('Adoption post not found or you don\'t have permission to delete it');
    }

    // Delete associated images
    for (const image of post.PetAdoptionPostImage) {
      const imagePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the post (this will cascade delete the images in the database)
    await prisma.petAdoptionPost.delete({
      where: { id: postId }
    });

    // Check if pet has other adoption posts and if petProfileId exists
    if (post.petProfileId) {
      const otherPosts = await prisma.petAdoptionPost.findFirst({
        where: {
          petProfileId: post.petProfileId
        }
      });

      // If no other posts, mark pet as not adoptable
      if (!otherPosts) {
        await prisma.petProfile.update({
          where: { id: post.petProfileId },
          data: { isAdoptable: false }
        });
      }
    }

    return {
      success: true,
      message: 'Adoption post deleted successfully'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to delete adoption post');
  }
};

export const applyForAdoption = async (userId: string, data: {
  adoptionPostId: string;
  message: string;
}): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Verify that the user has PURRPARENT verification level
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.verificationLevel !== 'PURRPARENT' && 
        user.verificationLevel !== 'SUPER_ADOPTER' && 
        user.verificationLevel !== 'VET') {
      throw new Error('You must be a verified Purrparent to apply for adoption');
    }

    // Check if the adoption post exists
    const adoptionPost = await prisma.petAdoptionPost.findUnique({
      where: { id: data.adoptionPostId },
      include: {
        author: true,
        petProfile: true
      }
    });

    if (!adoptionPost) {
      throw new Error('Adoption post not found');
    }

    // Check if the user is not applying to their own post
    if (adoptionPost.authorId === userId) {
      throw new Error('You cannot apply to adopt your own pet');
    }

    // Check if the user has already applied for this post
    const existingApplication = await prisma.adoptionApplication.findFirst({
      where: {
        adoptionPostId: data.adoptionPostId,
        applicantId: userId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existingApplication) {
      throw new Error('You have already applied to adopt this pet');
    }

    // Create a chat room for the adoption conversation
    const chatRoom = await prisma.chat.create({
      data: {
        name: `Adoption Chat - ${adoptionPost.title}`,
        ownerId: adoptionPost.authorId,
        participants: {
          create: [
            { userId: adoptionPost.authorId },
            { userId: userId }
          ]
        }
      }
    });

    // Create the adoption application
    const application = await prisma.adoptionApplication.create({
      data: {
        message: data.message,
        applicantId: userId,
        petOwnerId: adoptionPost.authorId,
        adoptionPostId: data.adoptionPostId
      },
      include: {
        applicant: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        adoptionPost: {
          include: {
            petProfile: true
          }
        }
      }
    });

    // Create notification for the pet owner
    await prisma.notification.create({
      data: {
        type: 'PET_APPLICATION',
        message: `${user.firstName} ${user.lastName} has applied to adopt ${adoptionPost.petProfile?.name || 'your pet'}`,
        receiverId: adoptionPost.authorId,
        senderId: userId,
        entityId: application.id,
        entityType: 'ADOPTION_APPLICATION'
      }
    });

    return {
      success: true,
      message: 'Adoption application submitted successfully',
      data: {
        ...application,
        chatRoomId: chatRoom.id
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to apply for adoption');
  }
};

export const getMyAdoptionApplications = async (userId: string, page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;
    
    const applications = await prisma.adoptionApplication.findMany({
      where: {
        applicantId: userId
      },
      include: {
        adoptionPost: {
          include: {
            petProfile: true,
            PetAdoptionPostImage: {
              take: 1
            },
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
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

    const hasMore = applications.length > limit;
    const applicationsToReturn = hasMore ? applications.slice(0, limit) : applications;

    return {
      success: true,
      message: 'Adoption applications retrieved successfully',
      data: applicationsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get adoption applications error:', error);
    return {
      success: false,
      message: 'Failed to get adoption applications',
      hasMore: false
    };
  }
};

export const getReceivedAdoptionApplications = async (userId: string, page: number = 1, limit: number = 10): Promise<{
  success: boolean;
  message: string;
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;
    
    const applications = await prisma.adoptionApplication.findMany({
      where: {
        petOwnerId: userId
      },
      include: {
        applicant: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        adoptionPost: {
          include: {
            petProfile: true,
            PetAdoptionPostImage: {
              take: 1
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

    const hasMore = applications.length > limit;
    const applicationsToReturn = hasMore ? applications.slice(0, limit) : applications;

    return {
      success: true,
      message: 'Received adoption applications retrieved successfully',
      data: applicationsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get received adoption applications error:', error);
    return {
      success: false,
      message: 'Failed to get received adoption applications',
      hasMore: false
    };
  }
};

export const updateAdoptionApplicationStatus = async (
  userId: string, 
  applicationId: string, 
  data: {
    status: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if the application exists and belongs to the user
    const application = await prisma.adoptionApplication.findFirst({
      where: {
        id: applicationId,
        petOwnerId: userId
      },
      include: {
        applicant: true,
        adoptionPost: {
          include: {
            petProfile: true
          }
        }
      }
    });

    if (!application) {
      throw new Error('Application not found or you don\'t have permission to update it');
    }

    if (application.status !== 'PENDING') {
      throw new Error('This application has already been processed');
    }

    // Update the application status
    const updatedApplication = await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null
      },
      include: {
        applicant: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        adoptionPost: {
          include: {
            petProfile: true
          }
        }
      }
    });

    // Create notification for the applicant
    const petName = application.adoptionPost.petProfile?.name || 'the pet';
    const notificationMessage = data.status === 'APPROVED'
      ? `Your application to adopt ${petName} has been approved!`
      : `Your application to adopt ${petName} has been rejected.`;

    await prisma.notification.create({
      data: {
        type: 'APPLICATION_UPDATE',
        message: notificationMessage,
        receiverId: application.applicantId,
        senderId: userId,
        entityId: applicationId,
        entityType: 'ADOPTION_APPLICATION'
      }
    });

    // If approved, mark the post as inactive
    if (data.status === 'APPROVED') {
      await prisma.petAdoptionPost.update({
        where: { id: application.adoptionPostId },
        data: { isActive: false }
      });

      // Reject all other pending applications for this post
      const otherApplications = await prisma.adoptionApplication.findMany({
        where: {
          adoptionPostId: application.adoptionPostId,
          id: { not: applicationId },
          status: 'PENDING'
        }
      });

      for (const otherApp of otherApplications) {
        await prisma.adoptionApplication.update({
          where: { id: otherApp.id },
          data: { 
            status: 'REJECTED',
            rejectionReason: 'Another applicant was selected for adoption'
          }
        });

        // Notify other applicants
        await prisma.notification.create({
          data: {
            type: 'APPLICATION_UPDATE',
            message: `Your application to adopt ${petName} was rejected because another applicant was selected.`,
            receiverId: otherApp.applicantId,
            senderId: userId,
            entityId: otherApp.id,
            entityType: 'ADOPTION_APPLICATION'
          }
        });
      }
    }

    return {
      success: true,
      message: `Application ${data.status.toLowerCase()} successfully`,
      data: updatedApplication
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to update application status');
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        coverPicture: true
      }
    });

    if (!user) {
      return { 
        success: false, 
        message: 'User not found' 
      };
    }

    // Remove sensitive information
    const { password, ...userData } = user;

    return { 
      success: true, 
      message: 'User profile retrieved successfully',
      data: userData
    };
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    throw new Error('Failed to retrieve user profile');
  }
};
