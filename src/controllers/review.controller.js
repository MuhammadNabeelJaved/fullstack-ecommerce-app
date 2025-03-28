import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
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

// Delete a review for a product

export const deleteReview = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            throw new ApiError("Review not found", 404);
        }

        await review.deleteOne();

        return new ApiResponse(res, { statusCode: 200, message: "Review deleted successfully" });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})

// Get all reviews for a product

export const getAllReviews = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ product: id });

        if (!reviews) {
            throw new ApiError("Reviews not found", 404);
        }

        return new ApiResponse(res, { statusCode: 200, message: "Reviews fetched successfully", data: reviews });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})
