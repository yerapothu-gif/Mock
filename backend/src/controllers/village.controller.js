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
                    pages: Math.ceil(total / limit),
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
export const getMapVillages = asyncHandler(async (req, res) => {
    const { district, stage } = req.query;

    const filter = {};
    if (district) filter.district = new RegExp(district.trim(), "i");
    if (stage) filter.readinessStage = stage;

    const pins = await Village.find(filter).select(
        "_id name district block location readinessStage farmerCount activeVleId"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, pins, "Map village pins fetched successfully"));
});

/**
 * Geospatial nearby proximity check ($nearSphere)
 * GET /api/villages/nearby?lat=...&lng=...&radiusKm=5
 */
export const getNearbyVillages = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 5 } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "Latitude (lat) and Longitude (lng) query parameters are required");
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseFloat(radiusKm) * 1000;

    const nearbyVillages = await Village.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: radiusMeters,
            },
        },
    }).limit(20);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                center: { lat: latitude, lng: longitude },
                radiusKm: Number(radiusKm),
                count: nearbyVillages.length,
                villages: nearbyVillages,
            },
            "Nearby villages retrieved successfully"
        )
    );
});

/**
 * Get full village detail (including farmers count and assessments)
 * GET /api/villages/:id
 */
export const getVillageById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const village = await Village.findById(id)
        .populate("activeVleId", "name phone assignedEquipment totalEarnings")
        .populate("createdBy", "name phone");

    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    const [farmerList, latestAssessment] = await Promise.all([
        Farmer.find({ villageId: id }).select("name phone landSize crops isPotentialVLE education"),
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
 * Update village record
 * PUT /api/villages/:id
 */
export const updateVillage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const village = await Village.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, village, "Village updated successfully"));
});
