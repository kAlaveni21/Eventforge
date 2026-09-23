import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISessionAttendance {
  session: mongoose.Types.ObjectId;
  attendedAt: Date;
}

export interface IAttendance extends Document {
  event: mongoose.Types.ObjectId;
  attendee: mongoose.Types.ObjectId;
  registration: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  sessionsAttended: ISessionAttendance[];
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    attendee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registration: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    sessionsAttended: [
      {
        session: {
          type: Schema.Types.ObjectId,
          ref: 'Session',
          required: true,
        },
        attendedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate event check-in records for the same registration
attendanceSchema.index({ event: 1, registration: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
