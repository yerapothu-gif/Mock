import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Village } from "../models/village.model.js";
import { Farmer } from "../models/farmer.model.js";
import { NeedsAssessment } from "../models/needsAssessment.model.js";

const createVillage = asyncHandler(async (req, res) => {
    const {
        name,
        district,
        block,
        location,
        farmerCount,
        majorCrops,
        waterResources,
        acres,
        communityStructures,
        readinessStage,
        offlineId,
    } = req.body;

    if (!name?.trim() || !district?.trim()) {
        throw new ApiError(400, "Village name and district are required");
    }

    if (
        !location ||
        location.type !== "Point" ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Valid location with type 'Point' and [longitude, latitude] coordinates is required"
        );
    }

    // Offline-sync idempotency: if this offlineId was already synced, return the existing record
    if (offlineId) {
        const existing = await Village.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(new ApiResponse(200, existing, "Village already synced"));
        }
    }

    const village = await Village.create({
        name,
        district,
        block,
        location,
        farmerCount,
        majorCrops,
        waterResources,
        acres,
        communityStructures,
        readinessStage,
        offlineId,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, village, "Village created successfully"));
});

const getAllVillages = asyncHandler(async (req, res) => {
    const { search, district, stage, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search?.trim()) {
        filter.name = { $regex: search.trim(), $options: "i" };
    }
    if (district?.trim()) {
        filter.district = { $regex: `^${district.trim()}$`, $options: "i" };
    }
    if (stage?.trim()) {
        filter.readinessStage = stage.trim();
    }
    if (status?.trim()) {
        filter.status = status.trim();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);

    const [villages, total] = await Promise.all([
        Village.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Village.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                villages,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
            "Villages fetched successfully"
        )
    );
});

const getVillageMapPins = asyncHandler(async (req, res) => {
    const villages = await Village.find(
        {},
        { name: 1, location: 1, readinessStage: 1, district: 1 }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, villages, "Village map pins fetched successfully"));
});

const getNearbyVillages = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm } = req.query;

    if (!lat || !lng || !radiusKm) {
        throw new ApiError(400, "lat, lng, and radiusKm query params are required");
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = parseFloat(radiusKm);

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radius)) {
        throw new ApiError(400, "lat, lng, and radiusKm must be valid numbers");
    }

    const villages = await Village.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: radius * 1000,
            },
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, villages, "Nearby villages fetched successfully"));
});

const getVillageById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid village id");
    }

    const [village, farmers, assessments] = await Promise.all([
        Village.findById(id),
        Farmer.find({ villageId: id }).sort({ createdAt: -1 }),
        NeedsAssessment.find({ villageId: id }).sort({ createdAt: -1 }),
    ]);

    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    const villageData = {
        ...village.toObject(),
        farmers,
        assessments,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, villageData, "Village fetched successfully"));
});

const updateVillage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid village id");
    }

    const {
        name,
        district,
        block,
        location,
        farmerCount,
        majorCrops,
        waterResources,
        acres,
        communityStructures,
        readinessStage,
        status,
    } = req.body;

    if (
        location &&
        (location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2)
    ) {
        throw new ApiError(
            400,
            "Valid location with type 'Point' and [longitude, latitude] coordinates is required"
        );
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (district !== undefined) updates.district = district;
    if (block !== undefined) updates.block = block;
    if (location !== undefined) updates.location = location;
    if (farmerCount !== undefined) updates.farmerCount = farmerCount;
    if (majorCrops !== undefined) updates.majorCrops = majorCrops;
    if (waterResources !== undefined) updates.waterResources = waterResources;
    if (acres !== undefined) updates.acres = acres;
    if (communityStructures !== undefined) updates.communityStructures = communityStructures;
    if (readinessStage !== undefined) updates.readinessStage = readinessStage;
    if (status !== undefined) updates.status = status;

    const village = await Village.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, village, "Village updated successfully"));
});

export {
    createVillage,
    getAllVillages,
    getVillageMapPins,
    getNearbyVillages,
    getVillageById,
    updateVillage,
};
