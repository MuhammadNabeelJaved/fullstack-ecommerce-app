import asyncHandler from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiErrors.js"
import User from "../models/user.model.js"
import Cloudinary from "../utils/Cloudinary.js"
import sendEmail from "../utils/sendEmail.js"



const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(400, "User not found ")
        }
        const accessToken = await user.genrateAccessToken()
        const refreshToken = await user.genrateRefreshToken()
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}

export const register = asyncHandler(async (req, res) => {
    try {
        const { name, email, password } = req.body
        console.log("User data is:", name, email, password)
        const avatar = req.file?.path

        if (!name || !email || !password) {
            throw new ApiError(400, "Please provide all fields")
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

        let uploadedImage
        if (avatar) {
            uploadedImage = await Cloudinary(avatar)
            if (!uploadedImage) {
                throw new ApiError(500, "Server Error while uploading the avatar on cloudinary please try again later")
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: uploadedImage?.secure_url || undefined,
            isAccountVerified: false,
        })

        if (!user) {
            throw new ApiError(500, "Server Error while registering the user please try again later")
        }

        const otp = await user.genrateVerificationCode()

        console.log("Generated OTP", otp)

        try {
            const emailResponse = await sendEmail(email, "OTP Verification", otp)
            if (!emailResponse) {
                console.log("Failed to send email, but continuing registration process")
            }
        } catch (error) {
            console.log("Error sending email:", error.message)
            // Continue with registration even if email fails
        }


        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        }


        return apiResponse(res, { statusCode: 200, data: userData, message: "User registered successfully. Please check your email for verification code." })
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

        user.isAccountVerified = true
        user.verificationCode = undefined
        user.verificationCodeExpires = undefined
        await user.save({ validateBeforeSave: false })

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user?._id)

        console.log("accessToken", accessToken)
        console.log("refreshToken", refreshToken)

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isAccountVerified: user.isAccountVerified,
        }
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000
        }

        // Set cookies first, then send response to avoid "headers already sent" error
        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);

        return apiResponse(res, {
            statusCode: 200, data: {
                userData,
                accessToken,
                refreshToken
            }, message: "User verified successfully"
        });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


export const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            throw new ApiError(400, "Please provide all fields your email and password")
        }

        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            throw new ApiError(400, "Invalid email or password")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password")
        }

        if (!user.isAccountVerified) {
            throw new ApiError(400, "Please verify your email first")
        }

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user?._id)

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

        res.cookie("accessToken", accessToken, cookieOptions)
        res.cookie("refreshToken", refreshToken, cookieOptions)

        return apiResponse(res, { statusCode: 200, data: {userData, accessToken, refreshToken}, message: "User logged in successfully" })
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

export const logout = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $set:
                    { accessToken: null, refreshToken: null }
            },
            { new: true })
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return apiResponse(res, { statusCode: 200, message: "User logged out successfully" })
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user?._id)
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return apiResponse(res, { statusCode: 200, data: user, message: "Current user fetched successfully" })
    } catch (error) {

        throw new ApiError(500, error.message)
    }
})

export const updateCurrentUserPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            throw new ApiError(400, "Please provide all fields")
        }

        const user = await User.findById(req.user?._id).select("+password")
        if (!user) {
            throw new ApiError(400, "User not found")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        console.log("isPasswordCorrect", isPasswordCorrect)
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password")
        }

        // Update the password
        user.password = newPassword

        // Save the user
        await user.save({ validateBeforeSave: false })

        return apiResponse(res, { statusCode: 200, data: user, message: "User updated successfully" })
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

export const updateCurrentUserAvatar = asyncHandler(async (req, res) => {
    const avatar = req.file?.path
    if (!avatar) {
        throw new ApiError(400, "Please provide all fields")
    }
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(400, "User not found")
    }
    // delete the old avatar from cloudinary
    const isDeleted = await Cloudinary.deleteImage(user?.avatar)
    console.log("isDeleted", isDeleted)
    if (!isDeleted) {
        throw new ApiError(500, "Server Error while deleting the avatar from cloudinary please try again later")
    }

    const uploadedImage = await Cloudinary.uploadImage(avatar)
    if (!uploadedImage) {
        throw new ApiError(500, "Server Error while uploading the avatar on cloudinary please try again later")
    }

    user.avatar = uploadedImage?.secure_url

    await user.save({ validateBeforeSave: false })

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user?._id)
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
    res.cookie("accessToken", accessToken, cookieOptions)
    res.cookie("refreshToken", refreshToken, cookieOptions)
    return apiResponse(res, { statusCode: 200, data: userData, message: "User avatar updated successfully" })
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user?._id)
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        const { accessToken } = await genrateAccessAndRefreshToken(user?._id)
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
        res.cookie("accessToken", accessToken, cookieOptions)
        return apiResponse(res, { statusCode: 200, data: userData, message: "Access token refreshed successfully" })
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})
