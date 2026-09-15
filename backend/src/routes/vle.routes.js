import { Router } from "express";
import {
    createVLE,
    getAllVLEs,
    getVLEById,
    markTrainingComplete,
    assignEquipmentToVLE,
    getMyVLEProfile,
    getMyAssignedEquipment,
} from "../controllers/vle.controller.js";
import {
    createRentalTransaction,
    getMyTransactions,
    getVLETransactionLogs,
    getMyEarningsSummary,
    getMyWeeklyEarnings,
} from "../controllers/transaction.controller.js";
import {
    createContactRequest,
    getMyContactRequests,
    getAllContactRequests,
} from "../controllers/support.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// VLE self-service profile & equipment
router.route("/me").get(verifyJWT, requireRoles("vle"), getMyVLEProfile);
router.route("/me/equipment").get(verifyJWT, requireRoles("vle"), getMyAssignedEquipment);

// VLE transaction logging & earnings (Per TRD page 4-5)
router
    .route("/me/transactions")
    .post(verifyJWT, requireRoles("vle"), createRentalTransaction)
    .get(verifyJWT, requireRoles("vle"), getMyTransactions);

router.route("/me/earnings/summary").get(verifyJWT, requireRoles("vle"), getMyEarningsSummary);
router.route("/me/earnings/weekly").get(verifyJWT, requireRoles("vle"), getMyWeeklyEarnings);

// VLE Contact Support (Per TRD page 4-5)
router
    .route("/me/contact-admin")
    .post(verifyJWT, requireRoles("vle"), createContactRequest);
router
    .route("/me/contact-requests")
    .get(verifyJWT, requireRoles("vle"), getMyContactRequests);

// Admin-only management routes
router
    .route("/")
    .post(verifyJWT, requireRoles("admin"), createVLE)
    .get(verifyJWT, requireRoles("admin"), getAllVLEs);

router.route("/:id").get(verifyJWT, requireRoles("admin"), getVLEById);
router.route("/:id/training").put(verifyJWT, requireRoles("admin"), markTrainingComplete);
router.route("/:id/equipment").put(verifyJWT, requireRoles("admin"), assignEquipmentToVLE);
router.route("/:id/logs").get(verifyJWT, requireRoles("admin"), getVLETransactionLogs);
router.route("/:id/contact-requests").get(verifyJWT, requireRoles("admin"), getAllContactRequests);

export default router;
