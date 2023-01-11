import { Schema } from 'mongoose';
import BuildingData from '../types/buildingData';
import Preferences from '../types/preferences';

export const buildingSchema = new Schema<BuildingData>(
    {
        id: { required: true, type: String },
        name: { required: true, type: String },
        latitude: { required: false, type: Number },
        longitude: { required: false, type: Number }
    },
    { _id: false }
);

export const preferencesSchema = new Schema<Preferences>(
    {
        building: {
            required: false,
            type: buildingSchema
        },
        fav_rooms: {
            required: false,
            type: [String]
        }
    },
    { _id: false }
);
