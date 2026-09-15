import { Router } from "express";
import {
    createVillage,
    getAllVillages,
    getVillageMapPins,
    getNearbyVillages,
    getVillageById,
    updateVillage,
} from "../controllers/village.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Static sub-paths must be declared before the "/:id" param route below
router.route("/map").get(verifyJWT, getVillageMapPins);
router.route("/nearby").get(verifyJWT, requireRoles("volunteer", "admin"), getNearbyVillages);

router
    .route("/")
    .post(verifyJWT, requireRoles("volunteer", "admin"), createVillage)
    .get(verifyJWT, getAllVillages);

router
    .route("/:id")
    .get(verifyJWT, getVillageById)
    .put(verifyJWT, requireRoles("volunteer", "admin"), updateVillage);

export default router;
