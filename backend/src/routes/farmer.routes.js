import { Router } from "express";
import {
    addFarmer,
    getFarmersInVillage,
    getVLECandidates,
} from "../controllers/farmer.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router
    .route("/:villageId/farmers")
    .post(verifyJWT, requireRoles("volunteer", "admin"), addFarmer)
    .get(verifyJWT, getFarmersInVillage);

router.route("/:villageId/candidates").get(verifyJWT, requireRoles("admin"), getVLECandidates);

export default router;
