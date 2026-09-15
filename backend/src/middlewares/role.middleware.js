import { ApiError } from "../utils/ApiError.js";

const requireRole = (...roles) => (req, _, next) => {
    if (!roles.includes(req.user?.role)) {
        throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
};

export { requireRole };
