import mongoose, { Document, Model, Schema } from 'mongoose';

export type EventType =
  | 'Conference'
  | 'Workshop'
  | 'Exhibition'
  | 'Seminar'
  | 'Corporate Event'
  | 'Networking Event';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: EventType;
  category: string;
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  venue?: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  capacity: number;
  status: EventStatus;
  bannerImage: string;
  sponsors: mongoose.Types.ObjectId[];
  speakers: mongoose.Types.ObjectId[];
  sessions: mongoose.Types.ObjectId[];
  attendees: mongoose.Types.ObjectId[];
  assignedStaff: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    eventType: {
      type: String,
      required: [true, 'Please specify event type'],
      enum: [
        'Conference',
        'Workshop',
        'Exhibition',
        'Seminar',
        'Corporate Event',
        'Networking Event',
      ],
      default: 'Conference',
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      default: 'Technology',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationStart: {
      type: Date,
      required: [true, 'Registration start date is required'],
    },
    registrationEnd: {
      type: Date,
      required: [true, 'Registration end date is required'],
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'PUBLISHED',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    sponsors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sponsor',
      },
    ],
    speakers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Speaker',
      },
    ],
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedStaff: [
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

// Search text index for titles, descriptions, categories
eventSchema.index({ title: 'text', description: 'text', category: 'text' });

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
export default Event;
