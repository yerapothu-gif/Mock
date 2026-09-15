import { Router } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import {
    verifyJWT,
    optionalVerifyJWT,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Public / Bootstrap routes
router.route("/register").post(optionalVerifyJWT, registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (Requires valid JWT)
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
