import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Village } from "../models/village.model.js";
import { Farmer } from "../models/farmer.model.js";
import { NeedsAssessment } from "../models/needsAssessment.model.js";
import { RentalTransaction } from "../models/rentalTransaction.model.js";

// Idempotent upsert-by-offlineId for one collection of queued offline records.
// Each item is applied independently so one bad record can't fail the whole batch.
const syncCollection = async (Model, items = [], extraOnInsert = {}) => {
    let synced = 0;
    const conflicts = [];

    for (const item of items) {
        const { offlineId, _id, ...rest } = item || {};

        if (!offlineId) {
            conflicts.push({ item, reason: "Missing offlineId" });
            continue;
        }

        try {
            await Model.findOneAndUpdate(
                { offlineId },
                {
                    $set: rest,
                    $setOnInsert: { offlineId, ...extraOnInsert },
                },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );
            synced++;
        } catch (error) {
            conflicts.push({ offlineId, reason: error.message });
        }
    }

    return { synced, conflicts };
};

const batchSync = asyncHandler(async (req, res) => {
    const { villages = [], farmers = [], assessments = [], transactions = [] } = req.body;

    const vleFallbackId = req.user.role === "vle" ? req.user.linkedVleId : undefined;

    const [villageResult, farmerResult, assessmentResult, transactionResult] = await Promise.all([
        syncCollection(Village, villages, { createdBy: req.user._id }),
        syncCollection(Farmer, farmers),
        syncCollection(NeedsAssessment, assessments, { conductedBy: req.user._id }),
        syncCollection(
            RentalTransaction,
            transactions.map((t) => (t?.vleId ? t : { ...t, vleId: vleFallbackId })),
            { syncStatus: "synced" }
        ),
    ]);

    const summary = {
        villages: villageResult,
        farmers: farmerResult,
        assessments: assessmentResult,
        transactions: transactionResult,
    };

    const totalSynced =
        villageResult.synced + farmerResult.synced + assessmentResult.synced + transactionResult.synced;
    const totalConflicts =
        villageResult.conflicts.length +
        farmerResult.conflicts.length +
        assessmentResult.conflicts.length +
        transactionResult.conflicts.length;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                summary,
                `Synced ${totalSynced} record(s)${totalConflicts ? `, ${totalConflicts} conflict(s)` : ""}`
            )
        );
});

export { batchSync };
