import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NeedsAssessment } from "../models/needsAssessment.model.js";
import { Village } from "../models/village.model.js";

const REQUEST_STATUSES = ["open", "fulfilled", "cancelled"];

const submitAssessment = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const village = await Village.findById(villageId);
    if (!village) {
        throw new ApiError(404, "Village not found");
    }

    const { processesEvaluated, gapsIdentified, farmerRequests, summaryNotes, offlineId } =
        req.body;

    // Offline-sync idempotency: if this offlineId was already synced, return the existing record
    if (offlineId) {
        const existing = await NeedsAssessment.findOne({ offlineId });
        if (existing) {
            return res
                .status(200)
                .json(new ApiResponse(200, existing, "Assessment already synced"));
        }
    }

    const assessment = await NeedsAssessment.create({
        villageId,
        processesEvaluated,
        gapsIdentified,
        farmerRequests,
        summaryNotes,
        offlineId,
        conductedBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, assessment, "Needs assessment submitted successfully"));
});

const getAssessmentsForVillage = asyncHandler(async (req, res) => {
    const { villageId } = req.params;

    if (!mongoose.isValidObjectId(villageId)) {
        throw new ApiError(400, "Invalid village id");
    }

    const assessments = await NeedsAssessment.find({ villageId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, assessments, "Needs assessments fetched successfully"));
});

const updateAssessment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid assessment id");
    }

    const { processesEvaluated, gapsIdentified, farmerRequests, summaryNotes, status } =
        req.body;

    const updates = {};
    if (processesEvaluated !== undefined) updates.processesEvaluated = processesEvaluated;
    if (gapsIdentified !== undefined) updates.gapsIdentified = gapsIdentified;
    if (farmerRequests !== undefined) updates.farmerRequests = farmerRequests;
    if (summaryNotes !== undefined) updates.summaryNotes = summaryNotes;
    if (status !== undefined) updates.status = status;

    const assessment = await NeedsAssessment.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!assessment) {
        throw new ApiError(404, "Assessment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, assessment, "Assessment updated successfully"));
});

const getOpenRequests = asyncHandler(async (req, res) => {
    const requests = await NeedsAssessment.aggregate([
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
        { $unwind: "$village" },
        {
            $project: {
                _id: "$farmerRequests._id",
                assessmentId: "$_id",
                villageId: "$villageId",
                villageName: "$village.name",
                district: "$village.district",
                farmerId: "$farmerRequests.farmerId",
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
        .json(new ApiResponse(200, requests, "Open farmer requests fetched successfully"));
});

const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiError(400, "Invalid request id");
    }
    if (!status || !REQUEST_STATUSES.includes(status)) {
        throw new ApiError(400, `status must be one of: ${REQUEST_STATUSES.join(", ")}`);
    }

    const assessment = await NeedsAssessment.findOneAndUpdate(
        { "farmerRequests._id": requestId },
        { $set: { "farmerRequests.$.status": status } },
        { new: true }
    );

    if (!assessment) {
        throw new ApiError(404, "Farmer request not found");
    }

    const updatedRequest = assessment.farmerRequests.id(requestId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRequest, "Request status updated successfully"));
});

export {
    submitAssessment,
    getAssessmentsForVillage,
    updateAssessment,
    getOpenRequests,
    updateRequestStatus,
};
