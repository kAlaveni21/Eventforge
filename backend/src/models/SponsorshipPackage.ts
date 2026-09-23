import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISponsorshipPackage extends Document {
  name: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | string;
  price: number;
  benefits: string[];
  maxSponsors: number;
  event?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const sponsorshipPackageSchema = new Schema<ISponsorshipPackage>(
  {
    name: {
      type: String,
      required: true,
      enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    benefits: [{ type: String }],
    maxSponsors: {
      type: Number,
      default: 5,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  },
  {
    timestamps: true,
  }
);

export const SponsorshipPackage: Model<ISponsorshipPackage> =
  mongoose.models.SponsorshipPackage ||
  mongoose.model<ISponsorshipPackage>('SponsorshipPackage', sponsorshipPackageSchema);
export default SponsorshipPackage;
