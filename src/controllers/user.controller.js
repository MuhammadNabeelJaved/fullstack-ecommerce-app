import asyncHandler from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiErrors.js"
import User from "../models/user.model.js"


const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const avatar = req.file ? req.file.path : null

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }


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

    const user = await User.create({ name, email, password, avatar })
    apiResponse(res, { data: user, message: "User registered successfully" })
})











