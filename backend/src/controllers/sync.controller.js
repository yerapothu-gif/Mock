import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Village, Farmer, NeedsAssessment, RentalTransaction, VLE } from "../models/index.js";

/**
 * Batch Push Queued Offline Records (Dexie.js -> MongoDB)
 * POST /api/sync/batch
 */
export const batchSyncOfflineData = asyncHandler(async (req, res) => {
    const {
        villages = [],
        farmers = [],
        assessments = [],
        transactions = [],
    } = req.body;

    const results = {
        villages: { created: 0, updated: 0 },
        farmers: { created: 0, updated: 0 },
        assessments: { created: 0, updated: 0 },
        transactions: { created: 0, updated: 0 },
    };

    // 1. Sync Villages
    for (const vData of villages) {
        if (!vData.offlineId && !vData._id) continue;
        const query = vData.offlineId ? { offlineId: vData.offlineId } : { _id: vData._id };

        const updateData = {
            ...vData,
            status: "synced",
        };
        delete updateData._id;

        const existing = await Village.findOne(query);
        if (existing) {
            await Village.updateOne(query, { $set: updateData });
            results.villages.updated++;
        } else {
            await Village.create({
                ...updateData,
                createdBy: req.user._id,
            });
            results.villages.created++;
        }
    }

    // 2. Sync Farmers
    for (const fData of farmers) {
        if (!fData.offlineId && !fData._id) continue;
        const query = fData.offlineId ? { offlineId: fData.offlineId } : { _id: fData._id };

        const updateData = { ...fData };
        delete updateData._id;

        const existing = await Farmer.findOne(query);
        if (existing) {
            await Farmer.updateOne(query, { $set: updateData });
            results.farmers.updated++;
        } else {
            await Farmer.create(updateData);
            results.farmers.created++;
            if (updateData.villageId) {
                await Village.findByIdAndUpdate(updateData.villageId, { $inc: { farmerCount: 1 } });
            }
        }
    }

    // 3. Sync Needs Assessments
    for (const aData of assessments) {
        if (!aData.offlineId && !aData._id) continue;
        const query = aData.offlineId ? { offlineId: aData.offlineId } : { _id: aData._id };

        const updateData = {
            ...aData,
            status: "synced",
        };
        delete updateData._id;

        const existing = await NeedsAssessment.findOne(query);
        if (existing) {
            await NeedsAssessment.updateOne(query, { $set: updateData });
            results.assessments.updated++;
        } else {
            await NeedsAssessment.create({
                ...updateData,
                conductedBy: req.user._id,
            });
            results.assessments.created++;
            if (updateData.villageId) {
                await Village.findByIdAndUpdate(updateData.villageId, { readinessStage: "assessed" });
            }
        }
    }

    // 4. Sync Rental Transactions
    for (const tData of transactions) {
        if (!tData.offlineId && !tData._id) continue;
        const query = tData.offlineId ? { offlineId: tData.offlineId } : { _id: tData._id };

        const updateData = {
            ...tData,
            syncStatus: "synced",
        };
        delete updateData._id;

        const existing = await RentalTransaction.findOne(query);
        if (existing) {
            await RentalTransaction.updateOne(query, { $set: updateData });
            results.transactions.updated++;
        } else {
            const createdTx = await RentalTransaction.create(updateData);
            results.transactions.created++;
            // Increment VLE running totals
            if (createdTx.vleId) {
                await VLE.findByIdAndUpdate(createdTx.vleId, {
                    $inc: {
                        totalEarnings: Number(createdTx.feeCharged || 0),
                        totalRentalsCount: 1,
                        totalAcresServiced: Number(createdTx.acresCovered || 0),
                    },
                });
            }
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                results,
                "Batch offline data synchronized successfully"
            )
        );
});
