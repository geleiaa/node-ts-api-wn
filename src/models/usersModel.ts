import mongoose, { Document, Model } from 'mongoose';
import AuthService from '@src/services/userAuth';
import logger from '@src/logger';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

interface UserModel extends Omit<User, '_id'>, Document {}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.path('email').validate(
  async (email: string) => {
    const emailVerif = await mongoose.models.Users.countDocuments({ email });
    return !emailVerif;
  },
  'email ja cadastrado!!.',
  CUSTOM_VALIDATION.DUPLICATED
);

userSchema.pre<UserModel>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    logger.error(`Error hashing the password for the user ${this.name}`, err);
  }
});

export const User: Model<UserModel> = mongoose.model<UserModel>(
  'Users',
  userSchema
);
