import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer, Village, EDUCATION_QUALIFICATIONS } from "../models/index.js";

/**
 * Add a farmer record under a village
 * POST /api/villages/:villageId/farmers
 */
export const addFarmer = asyncHandler(async (req, res) => {
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
        name: name.trim(),
        phone: phone ? phone.trim() : "",
        contactInfo: contactInfo ? contactInfo.trim() : phone ? phone.trim() : "",
        landSize: Number(landSize),
        landholdingType: landholdingType || "small",
        crops: Array.isArray(crops) ? crops : [],
        isPotentialVLE: Boolean(isPotentialVLE),
        education: education || "No Formal Education",
        sourcesOfIncome: Array.isArray(sourcesOfIncome) ? sourcesOfIncome : [],
        notes: notes || "",
        offlineId: offlineId || undefined,
    });

    // Keep the village's farmerCount in sync
    await Village.findByIdAndUpdate(villageId, { $inc: { farmerCount: 1 } });

    return res
        .status(201)
        .json(new ApiResponse(201, farmer, "Farmer added successfully"));
});

/**
 * List all farmers in a village
 * GET /api/villages/:villageId/farmers
 */
export const getFarmersInVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const farmers = await Farmer.find({ villageId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, farmers, "Farmers fetched successfully"));
});

/**
 * Identify potential VLE candidates in a village (Admin Only)
 * GET /api/villages/:villageId/candidates
 */
export const getVLECandidates = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const candidates = await Farmer.find(
        { villageId, isPotentialVLE: true },
        { name: 1, phone: 1, education: 1, landSize: 1, landholdingType: 1, sourcesOfIncome: 1 }
    ).sort({ landSize: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, candidates, "VLE candidates fetched successfully"));
});
