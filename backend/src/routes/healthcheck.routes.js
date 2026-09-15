import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
    res.status(200).json({
        success: true,
        message: "Reaching Roots Backend API is online",
        timestamp: new Date().toISOString(),
    });
});

export default router;
