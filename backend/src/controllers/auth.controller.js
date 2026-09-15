import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User, VLE } from "../models/index.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};

/**
 * Generate access and refresh tokens for a user
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

/**
 * Register a new user (Volunteer, Admin, or VLE)
 * POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, phone, password, role, email, linkedVleId } = req.body;

    // Validation
    if (!name?.trim()) {
        throw new ApiError(400, "Name is required");
    }
    if (!phone?.trim()) {
        throw new ApiError(400, "Phone number is required");
    }
    if (!password || password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const assignedRole = role ? role.toLowerCase().trim() : "volunteer";
    if (!["volunteer", "admin", "vle"].includes(assignedRole)) {
        throw new ApiError(
            400,
            "Invalid role. Must be 'volunteer', 'admin', or 'vle'"
        );
    }

    // Role-gating: If users already exist in the system, only an Admin can create new accounts
    const totalUsers = await User.countDocuments();
    if (totalUsers > 0) {
        if (!req.user || req.user.role !== "admin") {
            throw new ApiError(
                403,
                "Forbidden: Only administrators can create new accounts"
            );
        }
    }

    // Check if phone number is already registered
    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
        throw new ApiError(409, "User with this phone number already exists");
    }

    // Create user
    const user = await User.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        password,
        role: assignedRole,
        linkedVleId: linkedVleId || null,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user record");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

/**
 * User Login
 * POST /api/auth/login
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone?.trim()) {
        throw new ApiError(400, "Phone number is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // Find user by phone
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
        throw new ApiError(401, "Invalid phone number or password");
    }

    if (!user.isActive) {
        throw new ApiError(
            403,
            "Account has been deactivated. Please contact an administrator."
        );
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid phone number or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate("linkedVleId", "name trainingStatus accountStatus assignedEquipment");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "Login successful"
            )
        );
});

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate("linkedVleId", "name trainingStatus accountStatus assignedEquipment totalEarnings");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

/**
 * Logout User
 * POST /api/auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * Refresh Access Token
 * POST /api/auth/refresh-token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret"
        );

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been used");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
