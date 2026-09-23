import mongoose, { Document, Model, Schema } from 'mongoose';

export type RegistrationStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface IRegistration extends Document {
  registrationId: string;
  attendee: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  coupon?: mongoose.Types.ObjectId;
  amount: number;
  status: RegistrationStatus;
  approvalStatus: ApprovalStatus;
  qrCode?: string;
  registeredAt: Date;
  createdAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    registrationId: {
      type: String,
      unique: true,
      required: true,
    },
    attendee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'APPROVED',
    },
    qrCode: {
      type: String,
      default: '',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user registration for an event
registrationSchema.index({ event: 1, attendee: 1 });

export const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>('Registration', registrationSchema);
export default Registration;
