import mongoose, { Schema } from "mongoose";

const vleContactRequestSchema = new Schema(
    {
        vleId: {
            type: Schema.Types.ObjectId,
            ref: "VLE",
            required: [true, "VLE reference is required"],
            index: true,
        },
        category: {
            type: String,
            enum: [
                "equipment_request",
                "maintenance_issue",
                "farmer_feedback",
                "general_query",
            ],
            default: "equipment_request",
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["open", "in_progress", "resolved"],
            default: "open",
            index: true,
        },
        adminResponse: {
            type: String,
            trim: true,
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

vleContactRequestSchema.index({ vleId: 1, status: 1 });

export const VLEContactRequest = mongoose.model(
    "VLEContactRequest",
    vleContactRequestSchema
);
