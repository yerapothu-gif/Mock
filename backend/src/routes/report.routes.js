import { Router } from "express";
import { getMachineryNeedReport } from "../controllers/report.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// AI-generated machinery demand report (Per TRD page 4-5)
router
    .route("/machinery-need")
    .get(verifyJWT, requireRoles("admin"), getMachineryNeedReport);

export default router;
