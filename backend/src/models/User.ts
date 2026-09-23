import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'EVENT_ORGANIZER'
  | 'EVENT_STAFF'
  | 'SPEAKER'
  | 'ATTENDEE'
  | 'SPONSOR';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  company?: string;
  title?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'PLATFORM_ADMIN',
        'EVENT_ORGANIZER',
        'EVENT_STAFF',
        'SPEAKER',
        'ATTENDEE',
        'SPONSOR',
      ],
      default: 'ATTENDEE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password as string);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
