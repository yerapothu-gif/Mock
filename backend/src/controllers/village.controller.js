import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Village, Farmer, NeedsAssessment } from "../models/index.js";

/**
 * Create a new village (Volunteer, Admin)
 * POST /api/villages
 */
export const createVillage = asyncHandler(async (req, res) => {
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

    if (!name?.trim()) {
        throw new ApiError(400, "Village name is required");
    }
    if (!district?.trim()) {
        throw new ApiError(400, "District is required");
    }
    if (!location?.coordinates || location.coordinates.length !== 2) {
        throw new ApiError(
            400,
            "Valid GeoJSON coordinates [longitude, latitude] are required"
        );
    }

    const [lng, lat] = location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new ApiError(400, "Invalid coordinates range");
    }

    // Idempotent offline sync check
    if (offlineId) {
        const existing = await Village.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        existing,
                        "Village already exists (idempotent sync)"
                    )
                );
        }
    }

    const village = await Village.create({
        name: name.trim(),
        district: district.trim(),
        block: block ? block.trim() : "",
        location: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
        },
        farmerCount: farmerCount !== undefined ? Number(farmerCount) : 0,
        majorCrops: Array.isArray(majorCrops) ? majorCrops : [],
        waterResources: Array.isArray(waterResources)
            ? waterResources
            : waterResources
            ? [waterResources]
            : [],
        acres: acres !== undefined ? Number(acres) : 0,
        communityStructures: Array.isArray(communityStructures)
            ? communityStructures
            : [],
        readinessStage: readinessStage || "identified",
        createdBy: req.user._id,
        status: "synced",
        offlineId: offlineId || undefined,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, village, "Village created successfully"));
});

/**
 * List all villages with filtering & pagination
 * GET /api/villages
 */
export const getAllVillages = asyncHandler(async (req, res) => {
    const { search, district, stage, readinessStage, status } = req.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (district) filter.district = new RegExp(district.trim(), "i");
    if (stage || readinessStage) filter.readinessStage = stage || readinessStage;
    if (status) filter.status = status;
    if (search?.trim()) {
        filter.name = new RegExp(search.trim(), "i");
    }

    const [villages, total] = await Promise.all([
        Village.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("activeVleId", "name phone totalEarnings"),
        Village.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                villages,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Villages fetched successfully"
        )
    );
});

/**
 * Lightweight village pins for fast Leaflet Map rendering
 * GET /api/villages/map
 */
export const getVillageMapPins = asyncHandler(async (req, res) => {
    const { district, stage } = req.query;

    const filter = {};
    if (district) filter.district = new RegExp(district.trim(), "i");
    if (stage) filter.readinessStage = stage;

    const pins = await Village.find(filter).select(
        "_id name district location readinessStage"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, pins, "Village map pins fetched successfully"));
});

/**
 * Geospatial nearby proximity check ($nearSphere) - prevents duplicate village entry
 * GET /api/villages/nearby?lat=...&lng=...&radiusKm=5
 */
export const getNearbyVillages = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 5 } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "lat and lng query parameters are required");
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

/**
 * Get full village detail (including farmers list and latest needs assessment)
 * GET /api/villages/:id
 */
export const getVillageById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid village id");
    }

    const village = await Village.findById(id)
        .populate("activeVleId", "name phone assignedEquipment totalEarnings")
        .populate("createdBy", "name phone");

    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    const [farmerList, latestAssessment] = await Promise.all([
        Farmer.find({ villageId: id }).select(
            "name phone landSize crops isPotentialVLE education"
        ),
        NeedsAssessment.findOne({ villageId: id }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                village,
                farmers: farmerList,
                latestAssessment,
            },
            "Village details fetched successfully"
        )
    );
});

/**
 * Update village record (info, or advance readinessStage)
 * PUT /api/villages/:id
 */
export const updateVillage = asyncHandler(async (req, res) => {
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

    if (location) {
        if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            throw new ApiError(
                400,
                "Valid location with type 'Point' and [longitude, latitude] coordinates is required"
            );
        }
        const [lng, lat] = location.coordinates;
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            throw new ApiError(400, "Invalid coordinates range");
        }
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
