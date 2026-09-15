import { Router } from "express";
import {
    createVillage,
    getAllVillages,
    getVillageMapPins,
    getNearbyVillages,
    getVillageById,
    updateVillage,
} from "../controllers/village.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router
    .route("/")
    .post(verifyJWT, requireRole("volunteer", "admin"), createVillage)
    .get(verifyJWT, getAllVillages);

// Static sub-paths must be declared before the "/:id" param route below
router.route("/map").get(verifyJWT, getVillageMapPins);
router.route("/nearby").get(verifyJWT, requireRole("volunteer", "admin"), getNearbyVillages);

router
    .route("/:id")
    .get(verifyJWT, getVillageById)
    .put(verifyJWT, requireRole("volunteer", "admin"), updateVillage);

export default router;
