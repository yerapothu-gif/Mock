import { Router } from "express";
import { updateAssessment } from "../controllers/needsAssessment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/:id").put(verifyJWT, requireRole("volunteer", "admin"), updateAssessment);

export default router;
