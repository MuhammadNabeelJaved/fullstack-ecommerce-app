import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";




export const createOrder = asyncHandler(async (req, res) => {
    const { products, totalPrice, totalQuantity } = req.body || {}
    const user = req.user



    try {
        if (!products || !totalPrice || !totalQuantity) {
            throw new ApiError(400, "All fields are required.")
        }

        if (!user) {
            throw new ApiError(400, "User not found.")
        }
        const order = await Order.create({
            user,
            products,
            totalPrice,
            totalQuantity
        })

        if (!order) {
            throw new ApiError(400, "Order not created.")
        }


    } catch (error) {

    }
})
