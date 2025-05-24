import mongoose, { Schema, Document } from 'mongoose';

export interface IPetProfile extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  size?: string;
  color?: string;
  description?: string;
  profilePicture?: string;
  isAdoptable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PetProfileSchema: Schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['DOG', 'CAT', 'BIRD', 'REPTILE', 'SMALL_ANIMAL', 'OTHER']
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'UNKNOWN']
  },
  size: {
    type: String,
    enum: ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']
  },
  color: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  isAdoptable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IPetProfile>('PetProfile', PetProfileSchema); 