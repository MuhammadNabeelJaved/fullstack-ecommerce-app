import cloudinary from "cloudinary"
import { ApiError } from "./apiErrors.js"
import fs from "fs"
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

export default uploadImage

