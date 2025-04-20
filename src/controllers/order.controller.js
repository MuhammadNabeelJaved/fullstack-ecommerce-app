import { ApiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
// import paypal from "../paypal.js";




export const createOrder = asyncHandler(async (req, res) => {
    try {

    } catch (error) {
        return ApiError(500, error.message);

    }
})


