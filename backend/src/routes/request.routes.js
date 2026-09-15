import { Router } from "express";
import {
    getOpenRequests,
    updateRequestStatus,
} from "../controllers/needsAssessment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/open").get(verifyJWT, requireRole("admin"), getOpenRequests);
router.route("/:requestId/status").patch(verifyJWT, requireRole("admin"), updateRequestStatus);

export default router;
