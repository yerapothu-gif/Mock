import { Router } from "express";
import {
    addFarmerToVillage,
    getFarmersByVillage,
    getPotentialVLECandidates,
} from "../controllers/farmer.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router
    .route("/:villageId/farmers")
    .post(verifyJWT, requireRoles("volunteer", "admin"), addFarmerToVillage)
    .get(verifyJWT, getFarmersByVillage);

router
    .route("/:villageId/candidates")
    .get(verifyJWT, requireRoles("admin"), getPotentialVLECandidates);

export default router;
