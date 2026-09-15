import { Router } from "express";
import {
    getOpenRequests,
    updateRequestStatus,
} from "../controllers/needsAssessment.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/open").get(verifyJWT, requireRoles("admin"), getOpenRequests);
router.route("/:requestId/status").patch(verifyJWT, requireRoles("admin"), updateRequestStatus);

export default router;
