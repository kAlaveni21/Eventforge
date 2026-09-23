import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVenueRoom {
  name: string;
  capacity: number;
  floor?: string;
}

export interface IVenue extends Document {
  name: string;
  location: string;
  address: string;
  capacity: number;
  rooms: IVenueRoom[];
  facilities: string[];
  availability: boolean;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: [true, 'Please provide venue name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide city/state or location name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide full address'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide venue total capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    rooms: [
      {
        name: { type: String, required: true },
        capacity: { type: Number, required: true },
        floor: { type: String, default: '1st Floor' },
      },
    ],
    facilities: [{ type: String }],
    availability: {
      type: Boolean,
      default: true,
    },
    contactPerson: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Venue: Model<IVenue> =
  mongoose.models.Venue || mongoose.model<IVenue>('Venue', venueSchema);
export default Venue;
