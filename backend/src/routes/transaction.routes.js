import { Router } from "express";
import {
    createRentalTransaction,
    getMyTransactions,
    getVLETransactionLogs,
    getMyEarningsSummary,
    getMyWeeklyEarnings,
} from "../controllers/transaction.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// VLE rental transactions & analytics
router
    .route("/")
    .post(verifyJWT, requireRoles("vle"), createRentalTransaction)
    .get(verifyJWT, requireRoles("vle"), getMyTransactions);

router.route("/summary").get(verifyJWT, requireRoles("vle"), getMyEarningsSummary);
router.route("/weekly").get(verifyJWT, requireRoles("vle"), getMyWeeklyEarnings);

// Admin audit view of transactions for a specific VLE
router.route("/vle/:id").get(verifyJWT, requireRoles("admin"), getVLETransactionLogs);

export default router;
