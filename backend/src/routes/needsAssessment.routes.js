import { Router } from "express";
import {
    submitAssessment,
    getAssessmentsForVillage,
} from "../controllers/needsAssessment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router({ mergeParams: true });

router
    .route("/:villageId/needs-assessment")
    .post(verifyJWT, requireRole("volunteer", "admin"), submitAssessment)
    .get(verifyJWT, getAssessmentsForVillage);

export default router;
