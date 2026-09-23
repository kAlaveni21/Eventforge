import mongoose, { Document, Model, Schema } from 'mongoose';

export type TargetAudience =
  | 'All Attendees'
  | 'Speakers'
  | 'Staff'
  | 'Sponsors';

export interface IAnnouncement extends Document {
  event: mongoose.Types.ObjectId;
  title: string;
  message: string;
  targetAudience: TargetAudience;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    targetAudience: {
      type: String,
      enum: ['All Attendees', 'Speakers', 'Staff', 'Sponsors'],
      default: 'All Attendees',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement;
