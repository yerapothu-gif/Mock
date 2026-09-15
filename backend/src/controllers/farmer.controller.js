import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Farmer, Village, EDUCATION_QUALIFICATIONS } from "../models/index.js";

/**
 * Add a farmer record under a village
 * POST /api/villages/:villageId/farmers
 */
export const addFarmerToVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;
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
    if (landSize === undefined || Number(landSize) < 0) {
        throw new ApiError(400, "Valid land size is required");
    }

    const village = await Village.findById(villageId);
    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    // Idempotent offline check
    if (offlineId) {
        const existing = await Farmer.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(new ApiResponse(200, existing, "Farmer already registered (idempotent sync)"));
        }
    }

    // Validate education enum if provided
    let resolvedEducation = "No Formal Education";
    if (education && EDUCATION_QUALIFICATIONS.includes(education.trim())) {
        resolvedEducation = education.trim();
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
        education: resolvedEducation,
        sourcesOfIncome: Array.isArray(sourcesOfIncome) ? sourcesOfIncome : [],
        notes: notes || "",
        offlineId: offlineId || undefined,
    });

    // Increment village farmer count
    await Village.findByIdAndUpdate(villageId, {
        $inc: { farmerCount: 1 },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, farmer, "Farmer registered successfully"));
});

/**
 * List all farmers in a village
 * GET /api/villages/:villageId/farmers
 */
export const getFarmersByVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    const farmers = await Farmer.find({ villageId })
        .sort({ name: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, farmers, "Farmers retrieved successfully"));
});

/**
 * Get potential VLE candidates in a village (Admin Only)
 * GET /api/villages/:villageId/candidates
 */
export const getPotentialVLECandidates = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    const candidates = await Farmer.find({
        villageId,
        isPotentialVLE: true,
    }).sort({ landSize: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                candidates,
                "Potential VLE candidates retrieved successfully"
            )
        );
});
