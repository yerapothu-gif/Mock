import { Router } from "express";
import {
    createVillage,
    getAllVillages,
    getMapVillages,
    getNearbyVillages,
    getVillageById,
    updateVillage,
} from "../controllers/village.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Specialized map & proximity routes (must be declared before /:id)
router.route("/map").get(verifyJWT, getMapVillages);
router.route("/nearby").get(verifyJWT, getNearbyVillages);

// Standard CRUD routes
router
    .route("/")
    .post(verifyJWT, requireRoles("volunteer", "admin"), createVillage)
    .get(verifyJWT, getAllVillages);

router
    .route("/:id")
    .get(verifyJWT, getVillageById)
    .put(verifyJWT, requireRoles("volunteer", "admin"), updateVillage);

export default router;
