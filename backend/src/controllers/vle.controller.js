import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VLE, User, Village } from "../models/index.js";

/**
 * Create a new VLE profile (Admin Only)
 * POST /api/vle
 */
export const createVLE = asyncHandler(async (req, res) => {
    const {
        name,
        phone,
        contactInfo,
        villageId,
        userId,
        education,
        sourcesOfIncome,
        priorExperience,
    } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "VLE name is required");
    }
    if (!phone?.trim()) {
        throw new ApiError(400, "VLE phone number is required");
    }
    if (!villageId) {
        throw new ApiError(400, "Village ID is required");
    }

    // Verify village exists
    const village = await Village.findById(villageId);
    if (!village) {
        throw new ApiError(404, "Target village not found");
    }

    // Check if VLE already exists with this phone
    const existingVLE = await VLE.findOne({ phone: phone.trim() });
    if (existingVLE) {
        throw new ApiError(409, "A VLE with this phone number already exists");
    }

    // Optional user link
    let linkedUserId = userId || null;
    if (!linkedUserId) {
        // If a user with this phone already exists in User collection
        const existingUser = await User.findOne({ phone: phone.trim() });
        if (existingUser) {
            linkedUserId = existingUser._id;
        }
    }

    const vle = await VLE.create({
        name: name.trim(),
        phone: phone.trim(),
        contactInfo: contactInfo || { phone: phone.trim() },
        villageId,
        userId: linkedUserId,
        education: education || { qualification: "10th Pass" },
        sourcesOfIncome: sourcesOfIncome || [],
        priorExperience: priorExperience || "",
        createdBy: req.user._id,
    });

    // Update village activeVleId if village doesn't have one
    if (!village.activeVleId) {
        village.activeVleId = vle._id;
        await village.save({ validateBeforeSave: false });
    }

    // If a user account is linked, update user.linkedVleId
    if (linkedUserId) {
        await User.findByIdAndUpdate(linkedUserId, {
            linkedVleId: vle._id,
        });
    }

    return res
        .status(201)
        .json(new ApiResponse(201, vle, "VLE profile created successfully"));
});

/**
 * List all VLEs for Admin Dashboard & Leaderboard
 * GET /api/vle
 */
export const getAllVLEs = asyncHandler(async (req, res) => {
    const { status, trainingStatus, villageId } = req.query;

    const filter = {};
    if (status) filter.accountStatus = status;
    if (trainingStatus) filter.trainingStatus = trainingStatus;
    if (villageId) filter.villageId = villageId;

    const vles = await VLE.find(filter)
        .populate("villageId", "name district block")
        .populate("userId", "name phone email isActive")
        .sort({ totalEarnings: -1 }); // Leaderboard ranking by earnings

    return res
        .status(200)
        .json(new ApiResponse(200, vles, "VLEs fetched successfully"));
});

/**
 * Get single VLE details (Admin Only)
 * GET /api/vle/:id
 */
export const getVLEById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vle = await VLE.findById(id)
        .populate("villageId", "name district block farmerCount")
        .populate("userId", "name phone email")
        .populate("createdBy", "name phone");

    if (!vle) {
        throw new ApiError(404, "VLE not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, vle, "VLE details fetched successfully"));
});

/**
 * Mark VLE training complete (Admin Only - Account Unlock Gate)
 * PUT /api/vle/:id/training
 */
export const markTrainingComplete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vle = await VLE.findById(id);
    if (!vle) {
        throw new ApiError(404, "VLE not found");
    }

    vle.trainingStatus = "completed";
    vle.trainingCompletedAt = new Date();
    vle.accountStatus = "active"; // Training unlocks account access
    await vle.save();

    // Also activate linked user if present
    if (vle.userId) {
        await User.findByIdAndUpdate(vle.userId, {
            isActive: true,
            linkedVleId: vle._id,
        });
    }

    // Update village readinessStage to 'vle-active'
    await Village.findByIdAndUpdate(vle.villageId, {
        readinessStage: "vle-active",
        activeVleId: vle._id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                vle,
                "Training marked as complete. VLE account is now active and unlocked!"
            )
        );
});

/**
 * Assign equipment/machinery to VLE (Admin Only)
 * PUT /api/vle/:id/equipment
 */
export const assignEquipmentToVLE = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        machineId,
        machineType,
        model,
        serialNumber,
        hourlyRate,
        dailyRate,
        condition,
    } = req.body;

    if (!machineId?.trim() || !machineType?.trim()) {
        throw new ApiError(400, "machineId and machineType are required");
    }

    const vle = await VLE.findById(id);
    if (!vle) {
        throw new ApiError(404, "VLE not found");
    }

    // Check for duplicate machineId on this VLE
    const alreadyAssigned = vle.assignedEquipment.some(
        (eq) => eq.machineId.toLowerCase() === machineId.trim().toLowerCase()
    );
    if (alreadyAssigned) {
        throw new ApiError(409, "Machine with this ID is already assigned to this VLE");
    }

    const newEquipment = {
        machineId: machineId.trim(),
        machineType: machineType.trim(),
        model: model ? model.trim() : "",
        serialNumber: serialNumber ? serialNumber.trim() : "",
        ownership: "Foundation", // Tagged as Foundation ownership
        hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 0,
        dailyRate: dailyRate !== undefined ? Number(dailyRate) : 0,
        condition: condition || "good",
        assignedDate: new Date(),
    };

    vle.assignedEquipment.push(newEquipment);
    await vle.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                vle.assignedEquipment,
                "Equipment assigned to VLE successfully"
            )
        );
});

/**
 * VLE view own profile
 * GET /api/vle/me
 */
export const getMyVLEProfile = asyncHandler(async (req, res) => {
    // Find VLE profile linked to authenticated user
    const vle = await VLE.findOne({
        $or: [{ userId: req.user._id }, { _id: req.user.linkedVleId }],
    }).populate("villageId", "name district block location");

    if (!vle) {
        throw new ApiError(404, "No VLE profile linked to this user account");
    }

    // Account locked check
    if (vle.accountStatus === "locked") {
        throw new ApiError(
            403,
            "Access Denied: VLE training is pending. Your account remains locked until an Admin completes your training."
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, vle, "VLE profile fetched successfully"));
});

/**
 * VLE view assigned equipment
 * GET /api/vle/me/equipment
 */
export const getMyAssignedEquipment = asyncHandler(async (req, res) => {
    const vle = await VLE.findOne({
        $or: [{ userId: req.user._id }, { _id: req.user.linkedVleId }],
    });

    if (!vle) {
        throw new ApiError(404, "No VLE profile linked to this user account");
    }

    if (vle.accountStatus === "locked") {
        throw new ApiError(
            403,
            "Access Denied: Account is locked pending training."
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                vle.assignedEquipment,
                "Assigned equipment fetched successfully"
            )
        );
});
