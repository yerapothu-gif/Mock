import { Router } from "express";
import {
    submitNeedsAssessment,
    getAssessmentsByVillage,
    updateAssessment,
    getAllOpenRequests,
    updateRequestStatus,
} from "../controllers/needsAssessment.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

// Cross-village request management (must be before /:villageId)
router
    .route("/requests/open")
    .get(verifyJWT, requireRoles("admin"), getAllOpenRequests);

router
    .route("/requests/:requestId/status")
    .patch(verifyJWT, requireRoles("admin"), updateRequestStatus);

router
    .route("/needs-assessment/:id")
    .put(verifyJWT, requireRoles("volunteer", "admin"), updateAssessment);

// Village-specific needs assessments
router
    .route("/:villageId/needs-assessment")
    .post(verifyJWT, requireRoles("volunteer", "admin"), submitNeedsAssessment)
    .get(verifyJWT, getAssessmentsByVillage);

export default router;
