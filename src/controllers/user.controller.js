import asyncHandler from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiErrors.js"
import User from "../models/user.model.js"
import Cloudinary from "../utils/Cloudinary.js"
import User from "../models/user.model.js"


export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const avatar = req.file ? req.file.path : null

    try {
        if (!name || !email || !password) {
            throw new ApiError(400, "Please provide all fields your name, email and password")
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { name }
            ]
        })
        if (existingUser) {
            throw new ApiError(400, "User already exists")
        }

        const uploadedImage = await Cloudinary(avatar)
        avatar = uploadedImage

        const user = await User.create({ name, email, password, avatar: avatar?.secure_url })

        apiResponse(res, { statusCode: 200, data: user, message: "User registered successfully" })

    } catch (error) {
        throw new ApiError(500, error.message)
    }

})














