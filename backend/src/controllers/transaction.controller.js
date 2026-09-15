import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RentalTransaction, VLE } from "../models/index.js";
import mongoose from "mongoose";

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
    if (vle.accountStatus === "locked") {
        throw new ApiError(
            403,
            "Access Denied: Your VLE account is locked pending training completion."
        );
    }
    return vle;
};

/**
 * Log a new rental transaction
 * POST /api/vle/me/transactions (or /api/transactions)
 */
export const createRentalTransaction = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    const {
        villageId,
        farmerName,
        farmerId,
        machineId,
        machineType,
        date,
        durationHours,
        acresCovered,
        feeCharged,
        paymentStatus,
        offlineId,
    } = req.body;

    // Validation
    if (!farmerName?.trim()) {
        throw new ApiError(400, "Farmer name is required");
    }
    if (!machineId?.trim()) {
        throw new ApiError(400, "Machine ID is required");
    }
    if (durationHours === undefined || Number(durationHours) <= 0) {
        throw new ApiError(400, "Valid duration in hours is required");
    }
    if (feeCharged === undefined || Number(feeCharged) < 0) {
        throw new ApiError(400, "Valid fee charged is required");
    }

    // Idempotency: prevent duplicate transaction if offlineId was already synced
    if (offlineId) {
        const existingTx = await RentalTransaction.findOne({ offlineId });
        if (existingTx) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        existingTx,
                        "Transaction already recorded (idempotent sync)"
                    )
                );
        }
    }

    // Lookup machine type from assigned equipment if not explicitly passed
    let resolvedMachineType = machineType ? machineType.trim() : "";
    if (!resolvedMachineType && vle.assignedEquipment?.length > 0) {
        const matched = vle.assignedEquipment.find(
            (eq) => eq.machineId.toLowerCase() === machineId.trim().toLowerCase()
        );
        if (matched) {
            resolvedMachineType = matched.machineType;
        }
    }

    const transaction = await RentalTransaction.create({
        vleId: vle._id,
        villageId: villageId || vle.villageId,
        farmerName: farmerName.trim(),
        farmerId: farmerId || null,
        machineId: machineId.trim(),
        machineType: resolvedMachineType || "Agricultural Machinery",
        date: date ? new Date(date) : new Date(),
        durationHours: Number(durationHours),
        acresCovered: acresCovered !== undefined ? Number(acresCovered) : 0,
        feeCharged: Number(feeCharged),
        paymentStatus: paymentStatus || "paid",
        syncStatus: "synced",
        offlineId: offlineId || undefined,
    });

    // Automatically increment VLE's running totals in real-time
    await VLE.findByIdAndUpdate(vle._id, {
        $inc: {
            totalEarnings: Number(feeCharged),
            totalRentalsCount: 1,
            totalAcresServiced: Number(acresCovered || 0),
        },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                transaction,
                "Rental transaction logged successfully"
            )
        );
});

/**
 * Get VLE's own rental transaction history
 * GET /api/vle/me/transactions
 */
export const getMyTransactions = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { vleId: vle._id };
    if (req.query.startDate || req.query.endDate) {
        filter.date = {};
        if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
        if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const [transactions, total] = await Promise.all([
        RentalTransaction.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("villageId", "name district"),
        RentalTransaction.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transactions,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                },
            },
            "Transactions fetched successfully"
        )
    );
});

/**
 * Admin view transaction logs for any specific VLE
 * GET /api/vle/:id/logs (or /api/transactions/vle/:id)
 */
export const getVLETransactionLogs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const [transactions, total, vle] = await Promise.all([
        RentalTransaction.find({ vleId: id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("villageId", "name district"),
        RentalTransaction.countDocuments({ vleId: id }),
        VLE.findById(id).select("name phone totalEarnings totalRentalsCount"),
    ]);

    if (!vle) {
        throw new ApiError(404, "VLE not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                vle,
                transactions,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                },
            },
            "VLE transaction logs fetched successfully"
        )
    );
});

/**
 * Get VLE Running Earnings and Utilization Summary
 * GET /api/vle/me/earnings/summary
 */
export const getMyEarningsSummary = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    // Calculate utilization (hours worked this month vs 160 operational hours standard)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyStats = await RentalTransaction.aggregate([
        {
            $match: {
                vleId: vle._id,
                date: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: null,
                totalHours: { $sum: "$durationHours" },
                monthlyEarnings: { $sum: "$feeCharged" },
                monthlyRentals: { $sum: 1 },
            },
        },
    ]);

    const totalHoursMonth = monthlyStats[0]?.totalHours || 0;
    const monthlyEarnings = monthlyStats[0]?.monthlyEarnings || 0;
    const monthlyRentals = monthlyStats[0]?.monthlyRentals || 0;

    // Standard benchmark: 160 operating hours/month per active machine
    const machineCount = vle.assignedEquipment?.length || 1;
    const maxMonthlyCapacityHours = machineCount * 160;
    const estimatedUtilization = Math.min(
        100,
        Math.round((totalHoursMonth / maxMonthlyCapacityHours) * 100)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                allTimeEarnings: vle.totalEarnings,
                totalRentals: vle.totalRentalsCount,
                totalAcresServiced: vle.totalAcresServiced,
                assignedEquipmentCount: vle.assignedEquipment?.length || 0,
                last30Days: {
                    earnings: monthlyEarnings,
                    rentals: monthlyRentals,
                    hoursWorked: totalHoursMonth,
                    estimatedUtilizationPercent: estimatedUtilization,
                },
            },
            "Earnings summary calculated successfully"
        )
    );
});

/**
 * Get weekly earnings data for frontend chart visualization
 * GET /api/vle/me/earnings/weekly
 */
export const getMyWeeklyEarnings = asyncHandler(async (req, res) => {
    const vle = await resolveVLEForUser(req.user);

    // Fetch last 8 weeks of data
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyData = await RentalTransaction.aggregate([
        {
            $match: {
                vleId: vle._id,
                date: { $gte: eightWeeksAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $isoWeekYear: "$date" },
                    week: { $isoWeek: "$date" },
                },
                earnings: { $sum: "$feeCharged" },
                hours: { $sum: "$durationHours" },
                rentals: { $sum: 1 },
                acres: { $sum: "$acresCovered" },
            },
        },
        {
            $sort: { "_id.year": 1, "_id.week": 1 },
        },
    ]);

    const formattedData = weeklyData.map((item) => ({
        label: `W${item._id.week} (${item._id.year})`,
        week: item._id.week,
        year: item._id.year,
        earnings: item.earnings,
        hours: Math.round(item.hours * 10) / 10,
        rentals: item.rentals,
        acres: Math.round(item.acres * 10) / 10,
    }));

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                formattedData,
                "Weekly earnings stats fetched successfully"
            )
        );
});
