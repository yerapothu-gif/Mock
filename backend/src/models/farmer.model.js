import mongoose, { Schema } from "mongoose";

const farmerSchema = new Schema(
    {
        villageId: {
            type: Schema.Types.ObjectId,
            ref: "Village",
            required: [true, "Village reference is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Farmer name is required"],
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        contactInfo: {
            type: String,
            trim: true,
        },
        landSize: {
            type: Number,
            required: [true, "Land size in acres is required"],
            min: [0, "Land size cannot be negative"],
        },
        // Indian landholding categories useful for NGO intervention targeting
        landholdingType: {
            type: String,
            enum: ["marginal", "small", "medium", "large"],
            default: "small",
        },
        crops: [
            {
                type: String,
                trim: true,
            },
        ],
        // Flag to identify strong candidates for rural entrepreneurship (VLE)
        isPotentialVLE: {
            type: Boolean,
            default: false,
            index: true,
        },
        notes: {
            type: String,
            trim: true,
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

// Compound index for fast village-farmer listings
farmerSchema.index({ villageId: 1, name: 1 });

export const Farmer = mongoose.model("Farmer", farmerSchema);
