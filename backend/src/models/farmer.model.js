import mongoose, { Schema } from "mongoose";

export const EDUCATION_QUALIFICATIONS = [
    "No Formal Education",
    "Primary (1-5th)",
    "Middle (6-8th)",
    "10th Pass",
    "12th Pass",
    "Diploma / ITI",
    "Graduate",
    "Postgraduate",
    "Other",
];

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
        // Educational background with predefined options for VLE candidacy evaluation
        education: {
            type: String,
            enum: EDUCATION_QUALIFICATIONS,
            default: "No Formal Education",
            index: true,
        },
        sourcesOfIncome: [
            {
                type: String,
                trim: true, // e.g., "Farming", "Dairy", "Small Business", "Agri-labor"
            },
        ],
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
