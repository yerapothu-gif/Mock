import mongoose, { Schema } from "mongoose";

const rentalTransactionSchema = new Schema(
    {
        vleId: {
            type: Schema.Types.ObjectId,
            ref: "VLE",
            required: [true, "VLE reference is required"],
            index: true,
        },
        villageId: {
            type: Schema.Types.ObjectId,
            ref: "Village",
            index: true,
        },
        farmerName: {
            type: String,
            required: [true, "Farmer name is required"],
            trim: true,
            index: true,
        },
        farmerId: {
            type: Schema.Types.ObjectId,
            ref: "Farmer",
            default: null,
        },
        machineId: {
            type: String,
            required: [true, "Machine identifier is required"],
            trim: true,
        },
        machineType: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },
        durationHours: {
            type: Number,
            required: [true, "Duration in hours is required"],
            min: [0.1, "Duration must be at least 0.1 hour"],
        },
        acresCovered: {
            type: Number,
            default: 0,
            min: [0, "Acres covered cannot be negative"],
        },
        feeCharged: {
            type: Number,
            required: [true, "Fee charged is required"],
            min: [0, "Fee cannot be negative"],
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "pending", "partial"],
            default: "paid",
            index: true,
        },
        syncStatus: {
            type: String,
            enum: ["pending", "synced"],
            default: "synced",
            index: true,
        },
        // Client-generated UUID for offline batch synchronization (Dexie.js)
        offlineId: {
            type: String,
            sparse: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for fast VLE transaction history & weekly earnings charts
rentalTransactionSchema.index({ vleId: 1, date: -1 });
rentalTransactionSchema.index({ vleId: 1, syncStatus: 1 });

export const RentalTransaction = mongoose.model(
    "RentalTransaction",
    rentalTransactionSchema
);
