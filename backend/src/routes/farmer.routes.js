import { Router } from "express";
import {
    addFarmer,
    getFarmersInVillage,
    getVLECandidates,
} from "../controllers/farmer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router({ mergeParams: true });

router
    .route("/:villageId/farmers")
    .post(verifyJWT, requireRole("volunteer", "admin"), addFarmer)
    .get(verifyJWT, getFarmersInVillage);

router.route("/:villageId/candidates").get(verifyJWT, requireRole("admin"), getVLECandidates);

export default router;
