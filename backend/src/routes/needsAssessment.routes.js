import { Router } from "express";
import {
    submitAssessment,
    getAssessmentsForVillage,
} from "../controllers/needsAssessment.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router
    .route("/:villageId/needs-assessment")
    .post(verifyJWT, requireRoles("volunteer"), submitAssessment)
    .get(verifyJWT, getAssessmentsForVillage);

export default router;
