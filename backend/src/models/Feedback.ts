import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFeedback extends Document {
  event: mongoose.Types.ObjectId;
  session?: mongoose.Types.ObjectId;
  attendee: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
    },
    attendee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback for the same session by the same attendee
feedbackSchema.index({ session: 1, attendee: 1 }, { unique: true, sparse: true });

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);
export default Feedback;
