import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const tokenSecret = process.env.ACCESS_TOKEN_SECRET || "reaching_roots_access_token_secret_key_2026";
        const decodedToken = jwt.verify(token, tokenSecret)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

// RBAC Middleware: restrict access by user role(s)
export const requireRoles = (...roles) => {
    return (req, _, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Forbidden: Access requires one of [${roles.join(", ")}] roles`);
        }
        next();
    };
};

export const requireRole = (role) => requireRoles(role);

// Optional JWT verification: attaches user if valid token present, otherwise passes through
export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return next();

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_access_secret");
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (user) {
            req.user = user;
        }
        next();
    } catch {
        next();
    }
});