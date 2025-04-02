import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";



// Add and Create a review for a product

export const createReview = asyncHandler(async (req, res) => {
    try {

        const { reviewsComment, reviewsRating, productId } = req.body || req.params || {}

        if (!(reviewsComment || reviewsRating || productId)) {
            throw new ApiError(404, "Reviews comment, review rating and product Id must be required.")
        }

        if (reviewsRating < 1 || reviewsRating > 5) {
            throw new ApiError(404, "Review rating must be between 1 and 5.")
        }

        if (!req.user) {
            throw new ApiError(404, "User not found.")
        }


        const user = await User.findById(req.user?._id)

        if (!user) {
            throw new ApiError(404, "User not found.")
        }

        const product = await Product.findById(productId)

        if (!product) {
            throw new ApiError(404, "Product not found.")
        }

        const reviewExists = await Review.findOne({ user: req.user?._id, product: productId })

        if (reviewExists) {
            throw new ApiError(404, "You have already reviewed this product.")
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

        product.reviews.push(createdReview._id)
        await product.save({ validateBeforeSave: false })

        return apiResponse(res, { statusCode: 200, message: "Review Created successfully", data: createdReview });

    } catch (error) {
        throw new ApiError(500, error.message);
    }
})

// Delete a review for a product

export const deleteReview = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params || req.body || {}

        if (!id) {
            throw new ApiError(404, "Review id is required.")
        }

        const review = await Review.findById(id);

        if (!review) {
            throw new ApiError(404, "Review not found");
        }

        await review.deleteOne();

        return apiResponse(res, { statusCode: 200, message: "Review deleted successfully" });

    } catch (error) {
        throw new ApiError(500, error.message);
    }
})

// Get all reviews for a product

export const getAllReviews = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find();

        if (!reviews) {
            throw new ApiError(404, "Reviews not found");
        }

        return apiResponse(res, { statusCode: 200, message: "Reviews fetched successfully", data: reviews });

    } catch (error) {
        throw new ApiError(500, error.message);
    }
})
