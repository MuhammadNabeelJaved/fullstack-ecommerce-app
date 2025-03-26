import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [100, "Name must be less than 100 characters long"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,

    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        // maxlength: [32, "Password must be less than 32 characters long"],
        trim: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    avatar: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    refreshToken: {
        type: String,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        default: null,
    },
    verificationCodeExpires: {
        type: Date,
        default: null,
    },
    cart: {
        type: Array,
        default: [],
    },


}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.genrateVerificationCode = async function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    this.verificationCode = code
    this.verificationCodeExpires = Date.now() + 1000 * 60 * 10 // 10 minutes
    await this.save()
    return code
}
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.isVerificationCodeCorrect = async function (code) {
    return this.verificationCode === code && this.verificationCodeExpires > Date.now()
}

userSchema.methods.isVerificationCodeExpired = async function () {
    return this.verificationCodeExpires < Date.now()
}

userSchema.methods.genrateAccessToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRES_IN })
}

userSchema.methods.genrateRefreshToken = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN })
}

const User = mongoose.model("User", userSchema)

export default User