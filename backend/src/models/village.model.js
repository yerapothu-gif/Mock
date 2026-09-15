import mongoose, { Schema } from "mongoose";

const communityStructureSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true, // e.g., "SHG", "FPO", "Panchayat", "Youth Club"
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const villageSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Village name is required"],
            trim: true,
            index: true,
        },
        district: {
            type: String,
            required: [true, "District is required"],
            trim: true,
            index: true, // Focus on 6 MP districts e.g. Raisen, Sehore, Hoshangabad, etc.
        },
        block: {
            type: String,
            trim: true,
        },
        // GeoJSON format enables 2dsphere proximity & map queries
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true,
            },
            coordinates: {
                type: [Number], // Format: [longitude, latitude]
                required: [true, "Coordinates [longitude, latitude] are required"],
            },
        },
        farmerCount: {
            type: Number,
            default: 0,
            min: [0, "Farmer count cannot be negative"],
        },
        majorCrops: [
            {
                type: String,
                trim: true, // e.g. "Wheat", "Soybean", "Paddy", "Gram"
            },
        ],
        waterResources: [
            {
                type: String,
                trim: true, // e.g. "Canal", "Borewell", "Rainfed", "River", "Pond"
            },
        ],
        acres: {
            type: Number,
            default: 0,
            min: [0, "Acres cannot be negative"],
        },
        communityStructures: [communityStructureSchema],
        readinessStage: {
            type: String,
            enum: ["identified", "assessed", "vle-active"],
            default: "identified",
            index: true,
        },
        activeVleId: {
            type: Schema.Types.ObjectId,
            ref: "VLE",
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "synced"],
            default: "synced",
            index: true,
        },
        // Client-generated UUID for offline batch synchronization (Dexie.js)
        offlineId: {
            type: String,
            sparse: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// 2dsphere index for geospatial proximity queries (/api/villages/nearby)
villageSchema.index({ location: "2dsphere" });
villageSchema.index({ district: 1, readinessStage: 1 });
villageSchema.index({ name: "text" });

export const Village = mongoose.model("Village", villageSchema);
