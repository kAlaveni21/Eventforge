import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPresentationMaterial {
  title: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface ISpeaker extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  designation: string;
  company: string;
  bio: string;
  profileImage: string;
  expertise: string[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  availability: string[];
  presentationMaterial: IPresentationMaterial[];
  events: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const speakerSchema = new Schema<ISpeaker>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Speaker name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    expertise: [{ type: String }],
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    availability: [{ type: String }],
    presentationMaterial: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Speaker: Model<ISpeaker> =
  mongoose.models.Speaker || mongoose.model<ISpeaker>('Speaker', speakerSchema);
export default Speaker;
