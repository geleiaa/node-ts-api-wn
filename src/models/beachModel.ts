import { BeachPosition } from '@src/services/interfaces/Iforecast';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Beach {
  _id?: string;
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

const beachSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      // remove dados gerados pelo mongo
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface BeachModel extends Omit<Beach, '_id'>, Document {}

export const Beach: Model<BeachModel> = mongoose.model<BeachModel>(
  'Beach',
  beachSchema
);
