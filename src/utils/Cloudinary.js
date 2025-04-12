import dotenv from "dotenv"
import cloudinary from "cloudinary"
import { ApiError } from "./apiErrors.js"
import fs from "fs"

dotenv.config()

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImage = async (image) => {
    try {
        if (!image) {
            throw new ApiError(400, "Image is required")
        }
        const result = await cloudinary.v2.uploader.upload(image, {
            folder: "avatars"
        })
        fs.unlinkSync(image)
        return result
    } catch (error) {
        fs.unlinkSync(image)
        throw new ApiError(500, "Failed to upload image to Cloudinary")
    }
}

const deleteImage = async (imageUrl) => {
    console.log("Image URL", imageUrl)
    try {
        if (!imageUrl) {
            throw new ApiError(400, "Image URL is required")
        }
        const publicId = "avatars/" + imageUrl.split("/").pop().split(".")[0]
        //avatars/ko4rumwqpcgvl4r8bri5
        console.log("publicId", publicId)
        const result = await cloudinary.v2.uploader.destroy(publicId)
        if (!result) {
            throw new ApiError(500, "Failed to delete image from Cloudinary")
        }
        if (result.result === "ok") {
            return true
        }
        return false
    } catch (error) {
        throw new ApiError(500, "Failed to delete image from Cloudinary")
    }
}

export default { uploadImage, deleteImage }

