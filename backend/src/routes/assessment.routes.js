import { Router } from "express";
import { updateAssessment } from "../controllers/needsAssessment.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:id").put(verifyJWT, requireRoles("volunteer", "admin"), updateAssessment);

export default router;
