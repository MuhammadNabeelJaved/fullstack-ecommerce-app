import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";



// Add and Create a review for a product

export const createReview = asyncHandler(async (req, res) => {
    try {

        const { reviewsComment, reviewsRating, productId } = req.body



        if (!(reviewsComment || reviewsRating || productId)) {
            throw new ApiError(404, "Reviews comment, review rating and product Id must be required.")
        }

        const user = await User.find(req.user._id)

        if (!user) {
            throw new ApiError(404, "User not found.")
        }

        const product = await Product.findById(productId)

        if (!product) {
            throw new ApiError(404, "Product not found.")
        }

        const reviewData = {
            user,
            product,
            rating: reviewsRating,
            comment: reviewsComment
        }

        const createdReview = await Review.create(reviewData)

        if (!createdReview) {
            throw new ApiError(500, "Review not created plz try after some time")
        }

        return new ApiResponse(res, { statusCode: 200, message: "Review Created successfully" });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})