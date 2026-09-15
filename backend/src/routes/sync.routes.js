import { Router } from "express";
import { batchSyncOfflineData } from "../controllers/sync.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Bulk-push queued offline records on network reconnect
router
    .route("/batch")
    .post(verifyJWT, requireRoles("volunteer", "vle", "admin"), batchSyncOfflineData);

export default router;
