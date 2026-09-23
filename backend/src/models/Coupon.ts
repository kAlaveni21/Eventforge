import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  discountAmount?: number;
  validUntil?: Date;
  maxUses?: number;
  usedCount: number;
  event?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    validUntil: {
      type: Date,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
