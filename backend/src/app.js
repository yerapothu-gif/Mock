import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Route Imports
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import villageRouter from "./routes/village.routes.js";
import farmerRouter from "./routes/farmer.routes.js";
import needsAssessmentRouter from "./routes/needsAssessment.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";
import requestRouter from "./routes/request.routes.js";
import vleRouter from "./routes/vle.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import syncRouter from "./routes/sync.routes.js";
import reportRouter from "./routes/report.routes.js";
import supportRouter from "./routes/support.routes.js";

// Route Declarations
app.use("/api/healthcheck", healthcheckRouter);
app.use("/api/auth", authRouter);
app.use("/api/villages", villageRouter);
app.use("/api/villages", farmerRouter); // Nested under /api/villages/:villageId/farmers
app.use("/api/villages", needsAssessmentRouter); // Nested under /api/villages/:villageId/needs-assessment
app.use("/api/needs-assessment", assessmentRouter);
app.use("/api/requests", requestRouter);
app.use("/api/vle", vleRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/sync", syncRouter);
app.use("/api/reports", reportRouter);
app.use("/api/support", supportRouter);

// Error Handling (must be last)
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app }