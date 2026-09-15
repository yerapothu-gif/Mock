import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NeedsAssessment, Village } from "../models/index.js";

/**
 * Submit needs assessment for a village
 * POST /api/villages/:villageId/needs-assessment
 */
export const submitNeedsAssessment = asyncHandler(async (req, res) => {
    const { villageId } = req.params;
    const {
        processesEvaluated,
        gapsIdentified,
        farmerRequests,
        summaryNotes,
        offlineId,
    } = req.body;

    const village = await Village.findById(villageId);
    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    // Idempotent offline sync check
    if (offlineId) {
        const existing = await NeedsAssessment.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        existing,
                        "Needs assessment already submitted (idempotent sync)"
                    )
                );
        }
    }

    const assessment = await NeedsAssessment.create({
        villageId,
        processesEvaluated: Array.isArray(processesEvaluated)
            ? processesEvaluated
            : [],
        gapsIdentified: Array.isArray(gapsIdentified) ? gapsIdentified : [],
        farmerRequests: Array.isArray(farmerRequests) ? farmerRequests : [],
        summaryNotes: summaryNotes || "",
        conductedBy: req.user._id,
        status: "synced",
        offlineId: offlineId || undefined,
    });

    // Advance village readinessStage to 'assessed' if it was 'identified'
    if (village.readinessStage === "identified") {
        village.readinessStage = "assessed";
        await village.save({ validateBeforeSave: false });
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                assessment,
                "Needs assessment submitted successfully. Village marked as 'assessed'!"
            )
        );
});

/**
 * Get needs assessments for a village
 * GET /api/villages/:villageId/needs-assessment
 */
export const getAssessmentsByVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    const assessments = await NeedsAssessment.find({ villageId })
        .populate("conductedBy", "name phone")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assessments,
                "Village assessments retrieved successfully"
            )
        );
});

/**
 * Update needs assessment
 * PUT /api/villages/needs-assessment/:id
 */
export const updateAssessment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assessment = await NeedsAssessment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!assessment) {
        throw new ApiError(404, "Needs assessment not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assessment,
                "Assessment updated successfully"
            )
        );
});

/**
 * Get all open/unfulfilled farmer requests across all villages (Admin Only)
 * GET /api/villages/requests/open
 */
export const getAllOpenRequests = asyncHandler(async (req, res) => {
    const openRequests = await NeedsAssessment.aggregate([
        { $unwind: "$farmerRequests" },
        { $match: { "farmerRequests.status": "open" } },
        {
            $lookup: {
                from: "villages",
                localField: "villageId",
                foreignField: "_id",
                as: "village",
            },
        },
        { $unwind: { path: "$village", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: "$farmerRequests._id",
                assessmentId: "$_id",
                villageId: "$village._id",
                villageName: "$village.name",
                district: "$village.district",
                farmerName: "$farmerRequests.farmerName",
                requestType: "$farmerRequests.requestType",
                machineTypeNeeded: "$farmerRequests.machineTypeNeeded",
                urgency: "$farmerRequests.urgency",
                notes: "$farmerRequests.notes",
                status: "$farmerRequests.status",
                requestedAt: "$farmerRequests.requestedAt",
            },
        },
        { $sort: { requestedAt: -1 } },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                openRequests,
                "Open farmer requests retrieved successfully"
            )
        );
});

/**
 * Update request status (fulfilled / cancelled)
 * PATCH /api/villages/requests/:requestId/status
 */
export const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["open", "fulfilled", "cancelled"].includes(status)) {
        throw new ApiError(400, "Valid status ('open', 'fulfilled', 'cancelled') is required");
    }

    const assessment = await NeedsAssessment.findOneAndUpdate(
        { "farmerRequests._id": requestId },
        {
            $set: { "farmerRequests.$.status": status },
        },
        { new: true }
    );

    if (!assessment) {
        throw new ApiError(404, "Farmer request not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { requestId, status },
                `Farmer request marked as '${status}'`
            )
        );
});
