import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISession extends Document {
  title: string;
  description: string;
  event: mongoose.Types.ObjectId;
  speaker?: mongoose.Types.ObjectId;
  room: string;
  date: Date;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:15"
  capacity: number;
  category: string;
  attendees: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    speaker: {
      type: Schema.Types.ObjectId,
      ref: 'Speaker',
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 09:00)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 10:15)'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    category: {
      type: String,
      default: 'General',
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);
export default Session;
