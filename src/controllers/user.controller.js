import asyncHandler from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiErrors.js"
import User from "../models/user.model.js"
import Cloudinary from "../utils/Cloudinary.js"
import sendEmail from "../utils/resend.js"



const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(400, "User not found ")
        }
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}

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

        if (!uploadedImage) {
            throw new ApiError(500, "Server Error while uploading the avatar on cloudinary please try again later")
        }

        const user = await User.create({ name, email, password, avatar: uploadedImage?.secure_url })

        if (!user) {
            throw new ApiError(500, "Server Error while registering the user please try again later")
        }

        const otp = await user.genrateVerificationCode()

        const emailResponse = await sendEmail(email, "OTP Verification", otp)

        if (!emailResponse) {
            throw new ApiError(500, "Server Error while sending the email please try again later")
        }

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id)

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        }
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000
        }
        apiResponse(res, { statusCode: 200, data: userData, message: "User registered successfully" }).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions)

    } catch (error) {
        throw new ApiError(500, error.message)
    }

})

export const verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body

    try {
        if (!email || !code) {
            throw new ApiError(400, "Please provide all fields your email and code")
        }

        const user = await User.findOne({ email })
        if (!user) {
            throw new ApiError(400, "User not found")
        }

        const isCodeCorrect = await user.isVerificationCodeCorrect(code)
        if (!isCodeCorrect) {
            throw new ApiError(400, "Invalid verification code")
        }

        user.isVerified = true
        user.verificationCode = undefined
        user.verificationCodeExpires = undefined
        await user.save({ validateBeforeSave: false })

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id)

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        }
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000
        }
        apiResponse(res, { statusCode: 200, data: userData, message: "User verified successfully" }).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions)
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})













