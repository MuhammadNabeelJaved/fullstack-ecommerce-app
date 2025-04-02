import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { ApiError } from "../utils/apiErrors.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.cookies || req.headers.authorization?.split(" ")[1] || req.body.accessToken || req.body
        if (!accessToken && !refreshToken) {
            throw new ApiError(401, "Please login to access this page")
        }
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        if (!decoded) {
            throw new ApiError(401, "Invalid token")
        }
        
        // Add retry mechanism for database operations
        let retries = 3;
        let user = null;
        let lastError = null;
        
        while (retries > 0 && !user) {
            try {
                user = await User.findById(decoded?.id);
                break;
            } catch (error) {
                lastError = error;
                retries--;
                if (retries > 0) {
                    // Wait for 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        if (!user) {
            throw new ApiError(401, lastError ? "Database connection error. Please try again later." : "Please login to access this page");
        }
        
        req.user = user;
        await user.save({ validateBeforeSave: false });
        next();
    } catch (error) {
        throw new ApiError(401, error.message);
    }
}

// export const isAdmin = async (req, res, next) => {
//     if (req.user.role !== "admin") {
//         throw new ApiError(401, "You are not authorized to access this resource")
//     }
//     next()
// }