import mongoose, { Document, Model, Schema } from 'mongoose';

export type TicketCategory =
  | 'VIP'
  | 'Early Bird'
  | 'Standard'
  | 'Student'
  | 'Corporate';

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  name: TicketCategory | string;
  price: number;
  quantity: number;
  sold: number;
  benefits: string[];
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Ticket name is required'],
      enum: ['VIP', 'Early Bird', 'Standard', 'Student', 'Corporate'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    benefits: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
