import mongoose, { Schema } from "mongoose";

const assignedEquipmentSchema = new Schema(
    {
        machineId: {
            type: String,
            required: true,
            trim: true, // e.g. "EQ-ROT-001"
        },
        machineType: {
            type: String,
            required: true,
            trim: true, // e.g. "Rotavator", "Paddy Transplanter", "Power Sprayer"
        },
        model: {
            type: String,
            trim: true,
        },
        serialNumber: {
            type: String,
            trim: true,
        },
        ownership: {
            type: String,
            default: "Foundation", // Per doc: ownership tagged as "Foundation"
            required: true,
        },
        condition: {
            type: String,
            enum: ["excellent", "good", "fair", "maintenance_required"],
            default: "good",
        },
        hourlyRate: {
            type: Number,
            default: 0,
        },
        dailyRate: {
            type: Number,
            default: 0,
        },
        assignedDate: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const vleSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "VLE name is required"],
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: [true, "VLE phone number is required"],
            trim: true,
            index: true,
        },
        contactInfo: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true },
            address: { type: String, trim: true },
        },
        // Educational background & candidate selection criteria (per problem doc)
        education: {
            qualification: {
                type: String,
                trim: true, // e.g., "10th Pass", "12th Pass", "Graduate", "Diploma / ITI", "Basic"
                default: "Not Specified",
            },
            institution: {
                type: String,
                trim: true,
            },
        },
        sourcesOfIncome: [
            {
                type: String,
                trim: true, // e.g., "Farming", "Dairy / Livestock", "Retail Shop", "Agri-services"
            },
        ],
        priorExperience: {
            type: String,
            trim: true, // e.g., "Tractor driving license, machinery operation experience, basic accounting"
        },
        villageId: {
            type: Schema.Types.ObjectId,
            ref: "Village",
            required: [true, "Village reference is required"],
            index: true,
        },
        // Link to user auth credentials in User collection
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        // Training gates account activation
        trainingStatus: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
            index: true,
        },
        trainingCompletedAt: {
            type: Date,
            default: null,
        },
        // Account remains locked until training is marked completed by Admin
        accountStatus: {
            type: String,
            enum: ["locked", "active"],
            default: "locked",
            index: true,
        },
        assignedEquipment: [assignedEquipmentSchema],
        // Running totals for fast dashboard/stats rendering
        totalEarnings: {
            type: Number,
            default: 0,
            min: [0, "Total earnings cannot be negative"],
        },
        totalRentalsCount: {
            type: Number,
            default: 0,
        },
        totalAcresServiced: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

vleSchema.index({ villageId: 1, trainingStatus: 1 });

export const VLE = mongoose.model("VLE", vleSchema);
