import { BaseModel } from './baseModel';
import { BeachPosition } from '@src/services/interfaces/Iforecast';
import mongoose, { Schema } from 'mongoose';

export interface Beach extends BaseModel {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  userId: string;
}

export interface ExistingBeach extends Beach {
  id: string;
}

const beachSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      // remove dados gerados pelo mongo
      transform: (_, ret): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);


export const Beach = mongoose.model<Beach>('Beach', beachSchema)
