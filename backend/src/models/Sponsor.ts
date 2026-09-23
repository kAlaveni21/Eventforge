import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDeliverable {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: Date;
  updatedAt?: Date;
}

export interface ISponsor extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  logo: string;
  website: string;
  package: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | string;
  packageRef?: mongoose.Types.ObjectId;
  assignedDeliverables: IDeliverable[];
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  event: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  brandAssets?: string[];
  createdAt: Date;
}

const sponsorSchema = new Schema<ISponsor>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    package: {
      type: String,
      enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
      default: 'Bronze',
    },
    packageRef: {
      type: Schema.Types.ObjectId,
      ref: 'SponsorshipPackage',
    },
    assignedDeliverables: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        status: {
          type: String,
          enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
          default: 'PENDING',
        },
        dueDate: { type: Date },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    brandAssets: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Sponsor: Model<ISponsor> =
  mongoose.models.Sponsor || mongoose.model<ISponsor>('Sponsor', sponsorSchema);
export default Sponsor;
