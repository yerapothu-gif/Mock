import { Router } from "express";
import { batchSync } from "../controllers/sync.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/batch").post(verifyJWT, requireRole("volunteer", "vle"), batchSync);

export default router;
