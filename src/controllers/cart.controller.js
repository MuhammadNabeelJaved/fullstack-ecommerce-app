import Cart from "../models/cart.model";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";


// Add product to cart

export const addToCart = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        const product = await Product.findById(productId);

        if (!product) {
            throw new ApiError("Product not found", 404);
        }

        const existingItem = cart.products.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            cart.products.push({
                product: productId,
                quantity,
                price: product.price,
                totalPrice: product.price * quantity
            });
        }

        cart.totalPrice = cart.products.reduce((total, item) => total + item.totalPrice, 0);

        await cart.save();

        return new ApiResponse(res, { statusCode: 200, message: "Product added to cart", data: cart });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }

})


// Get cart items

export const getCartItems = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        return new ApiResponse(res, { statusCode: 200, message: "Cart items fetched", data: cart });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Update cart item quantity

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        const item = cart.products.id(itemId);

        if (!item) {
            throw new ApiError("Item not found", 404);
        }

        item.quantity = quantity;
        item.totalPrice = item.price * quantity;

        cart.totalPrice = cart.products.reduce((total, item) => total + item.totalPrice, 0);

        await cart.save();

        return new ApiResponse(res, { statusCode: 200, message: "Cart item quantity updated", data: cart });



    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Remove cart item

export const removeCartItem = asyncHandler(async (req, res) => {
    try {
        const { itemId } = req.params;

        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        const item = cart.products.id(itemId);

        if (!item) {
            throw new ApiError("Item not found", 404);
        }

        cart.products = cart.products.filter(item => item.id !== itemId);

        cart.totalPrice = cart.products.reduce((total, item) => total + item.totalPrice, 0);

        await cart.save();

        return new ApiResponse(res, { statusCode: 200, message: "Cart item removed", data: cart });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Clear cart

export const clearCart = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        cart.products = [];

        cart.totalPrice = 0;

        await cart.save();

        return new ApiResponse(res, { statusCode: 200, message: "Cart cleared", data: cart });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Get cart total price

export const getCartTotalPrice = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError("Cart not found", 404);
        }

        return new ApiResponse(res, { statusCode: 200, message: "Cart total price fetched", data: cart.totalPrice });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})