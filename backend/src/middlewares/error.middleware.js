import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        let statusCode = error.statusCode || 500;
        let message = error.message || "Something went wrong";

        if (error instanceof mongoose.Error.ValidationError) {
            statusCode = 400;
            message = Object.values(error.errors)
                .map((e) => e.message)
                .join(", ");
        } else if (error instanceof mongoose.Error.CastError) {
            statusCode = 400;
            message = `Invalid value for field "${error.path}"`;
        } else if (error.code === 11000) {
            statusCode = 409;
            message = "Duplicate value violates a unique constraint";
        }

        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    });
};

export { errorHandler };
