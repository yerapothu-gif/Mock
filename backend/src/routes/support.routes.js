import { Router } from "express";
import {
    createContactRequest,
    getMyContactRequests,
    getAllContactRequests,
    respondToContactRequest,
} from "../controllers/support.controller.js";
import { verifyJWT, requireRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// VLE routes
router
    .route("/")
    .post(verifyJWT, requireRoles("vle"), createContactRequest)
    .get(verifyJWT, requireRoles("vle"), getMyContactRequests);

// Admin routes
router.route("/requests").get(verifyJWT, requireRoles("admin"), getAllContactRequests);
router
    .route("/requests/:id/respond")
    .patch(verifyJWT, requireRoles("admin"), respondToContactRequest);

export default router;
