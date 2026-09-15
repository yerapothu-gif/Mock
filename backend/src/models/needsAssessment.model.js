import mongoose, { Schema } from "mongoose";

const processEvaluationSchema = new Schema(
    {
        stage: {
            type: String,
            required: true,
            enum: [
                "land_preparation",
                "sowing",
                "weeding",
                "spraying",
                "harvesting",
                "post_harvest",
                "other",
            ],
            trim: true,
        },
        challengesFaced: {
            type: String,
            trim: true,
        },
        currentPractice: {
            type: String,
            trim: true, // e.g. "Manual bullock ploughing", "Hired labor"
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const farmerDemandRequestSchema = new Schema(
    {
        farmerId: {
            type: Schema.Types.ObjectId,
            ref: "Farmer",
            default: null,
        },
        farmerName: {
            type: String,
            required: true,
            trim: true,
        },
        requestType: {
            type: String,
            required: true,
            trim: true, // e.g. "Tractor", "Rotavator", "Paddy Transplanter", "Sprayer", "Harvester"
        },
        machineTypeNeeded: {
            type: String,
            trim: true,
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        notes: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "fulfilled", "cancelled"],
            default: "open",
            index: true,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
    }
);

const needsAssessmentSchema = new Schema(
    {
        villageId: {
            type: Schema.Types.ObjectId,
            ref: "Village",
            required: [true, "Village reference is required"],
            index: true,
        },
        processesEvaluated: [processEvaluationSchema],
        gapsIdentified: [
            {
                type: String,
                trim: true, // e.g. "Machinery for paddy plantation", "Efficient spray machines", "Labor shortages"
            },
        ],
        farmerRequests: [farmerDemandRequestSchema],
        conductedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        summaryNotes: {
            type: String,
            trim: true,
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

// Indexes for aggregations and AI report generation
needsAssessmentSchema.index({ villageId: 1, createdAt: -1 });
needsAssessmentSchema.index({ "farmerRequests.status": 1 });

export const NeedsAssessment = mongoose.model(
    "NeedsAssessment",
    needsAssessmentSchema
);
