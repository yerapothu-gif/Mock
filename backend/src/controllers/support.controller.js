import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VLEContactRequest, VLE } from "../models/index.js";

/**
 * Helper to resolve VLE profile for the authenticated user
 */
const resolveVLEForUser = async (user) => {
    const vle = await VLE.findOne({
        $or: [{ userId: user._id }, { _id: user.linkedVleId }],
    });
    if (!vle) {
        throw new ApiError(404, "No VLE profile associated with this account");
    }
    return vle;
};

/**
 * VLE submits a support / equipment / maintenance ticket to admin
 * POST /api/vle/me/contact-admin (or /api/support)
 */
export const createContactRequest = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    const { category, subject, message, urgency } = req.body;

    if (!subject?.trim()) {
        throw new ApiError(400, "Subject is required");
    }
    if (!message?.trim()) {
        throw new ApiError(400, "Message is required");
    }

    const validCategories = [
        "equipment_request",
        "maintenance_issue",
        "farmer_feedback",
        "general_query",
    ];
    const resolvedCategory =
        category && validCategories.includes(category)
            ? category
            : "equipment_request";

    const request = await VLEContactRequest.create({
        vleId: vle._id,
        category: resolvedCategory,
        subject: subject.trim(),
        message: message.trim(),
        urgency: urgency || "medium",
        status: "open",
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                request,
                "Support request submitted to Admin successfully"
            )
        );
});

/**
 * VLE view own submitted support tickets
 * GET /api/vle/me/contact-requests
 */
export const getMyContactRequests = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    const requests = await VLEContactRequest.find({ vleId: vle._id })
        .populate("resolvedBy", "name")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                requests,
                "Your support tickets fetched successfully"
            )
        );
});

/**
 * Admin view all support tickets
 * GET /api/support/requests
 */
export const getAllContactRequests = asyncHandler(async (req, res) => {
    const { status, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const requests = await VLEContactRequest.find(filter)
        .populate({
            path: "vleId",
            select: "name phone villageId assignedEquipment",
            populate: { path: "villageId", select: "name district" },
        })
        .populate("resolvedBy", "name")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                requests,
                "Support requests fetched successfully"
            )
        );
});

/**
 * Admin reply to ticket and update status
 * PATCH /api/support/requests/:id/respond
 */
export const respondToContactRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    if (!adminResponse?.trim()) {
        throw new ApiError(400, "Admin response message is required");
    }

    const request = await VLEContactRequest.findById(id);
    if (!request) {
        throw new ApiError(404, "Support ticket not found");
    }

    request.adminResponse = adminResponse.trim();
    request.status = status || "resolved";
    request.resolvedAt = new Date();
    request.resolvedBy = req.user._id;
    await request.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                request,
                "Response submitted and ticket updated successfully"
            )
        );
});
