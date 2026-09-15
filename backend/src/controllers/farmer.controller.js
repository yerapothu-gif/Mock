import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer, EDUCATION_QUALIFICATIONS } from "../models/farmer.model.js";
import { Village } from "../models/village.model.js";

const addFarmer = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const village = await Village.findById(villageId);
    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    const {
        name,
        phone,
        contactInfo,
        landSize,
        landholdingType,
        crops,
        isPotentialVLE,
        education,
        sourcesOfIncome,
        notes,
        offlineId,
    } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Farmer name is required");
    }
    if (landSize === undefined || landSize === null || Number.isNaN(Number(landSize))) {
        throw new ApiError(400, "Land size is required");
    }
    if (education !== undefined && !EDUCATION_QUALIFICATIONS.includes(education)) {
        throw new ApiError(
            400,
            `education must be one of: ${EDUCATION_QUALIFICATIONS.join(", ")}`
        );
    }

    // Offline-sync idempotency: if this offlineId was already synced, return the existing record
    if (offlineId) {
        const existing = await Farmer.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(new ApiResponse(200, existing, "Farmer already synced"));
        }
    }

    const farmer = await Farmer.create({
        villageId,
        name,
        phone,
        contactInfo,
        landSize,
        landholdingType,
        crops,
        isPotentialVLE,
        education,
        sourcesOfIncome,
        notes,
        offlineId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, farmer, "Farmer added successfully"));
});

const getFarmersInVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const farmers = await Farmer.find({ villageId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, farmers, "Farmers fetched successfully"));
});

const getVLECandidates = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const candidates = await Farmer.find(
        { villageId, isPotentialVLE: true },
        { name: 1, phone: 1, education: 1, landSize: 1, landholdingType: 1, sourcesOfIncome: 1 }
    ).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, candidates, "VLE candidates fetched successfully"));
});

export { addFarmer, getFarmersInVillage, getVLECandidates };
