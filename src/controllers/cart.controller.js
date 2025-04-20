import Cart from "../models/cart.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import Product from "../models/product.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import CartProduct from "../models/cartProduct.model.js";
import mongoose from "mongoose";


// Add product to cart

async function recalculateCartTotal(cartId) {
    const cartItems = await CartProduct.find({ cart: cartId });
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0);
    await Cart.findByIdAndUpdate(cartId, { totalPrice });
    return totalPrice;
}
export const addToCart = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.body;
        const quantity = parseInt(req.body.quantity, 10);
        const user = req.user;

        console.log("Product ID", req.body);
        console.log("Quantity", quantity);

        // --- Basic Validations ---
        if (!productId || isNaN(quantity)) {
            throw new ApiError(400, "Product ID and a valid quantity are required");
        }
        if (quantity <= 0) {
            throw new ApiError(400, "Quantity must be greater than 0");
        }
        if (!user || !user._id) {
            throw new ApiError(401, "User not authenticated or user data incomplete");
        }

        // --- Find Product ---
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        if (product.price === undefined || product.price === null || product.price < 0) {
            throw new ApiError(500, "Product data is incomplete or invalid (price missing).");
        }

        // --- Find or Create User's Cart ---
        // Use findOneAndUpdate with upsert: true for atomicity in finding/creating the cart
        let cart = await Cart.findOneAndUpdate(
            { user: user._id }, // Find cart by user ID
            { $setOnInsert: { user: user._id, products: [], totalPrice: 0 } }, // Set these fields only if inserting (creating)
            { new: true, upsert: true } // Return the new/updated doc, create if doesn't exist
        );

        // --- Find Existing CartProduct or Create New ---
        let cartProduct = await CartProduct.findOne({ cart: cart._id, product: productId });
        let isNewItem = false;

        if (cartProduct) {
            // Item exists, update quantity and total
            cartProduct.quantity += quantity;
            cartProduct.itemTotalPrice = cartProduct.price * cartProduct.quantity; // Recalculate item total
            await cartProduct.save(); // Save the updated CartProduct
        } else {
            // Item does not exist, create a new CartProduct
            cartProduct = await CartProduct.create({
                cart: cart._id,
                product: productId,
                quantity: quantity,
                price: product.price, // Store price at time of adding
                itemTotalPrice: product.price * quantity
            });
            isNewItem = true;
        }

        // --- Update Cart Document ---
        // If it was a new item, add its reference to the cart's products array
        if (isNewItem) {
            // Use $addToSet to avoid duplicate references if something went wrong
            await Cart.updateOne(
                { _id: cart._id },
                { $addToSet: { products: cartProduct._id } }
            );
        }


        // Recalculate the total price for the entire cart
        const newTotalPrice = await recalculateCartTotal(cart._id); // Use the helper function

        // --- Fetch Updated Cart with Populated Data for Response ---
        // It's often better to fetch the final state rather than modifying the 'cart' variable in memory
        const finalCart = await Cart.findById(cart._id).populate({
            path: 'products',
            populate: { // Optionally populate the product details within CartProduct
                path: 'product',
                select: 'name price /* other fields you need */' // Select specific product fields
            }
        });

        if (!finalCart) {
            // This shouldn't happen if cart creation/finding worked, but safety check
            throw new ApiError(500, "Failed to retrieve updated cart details.");
        }

        // The finalCart.totalPrice should already be updated by recalculateCartTotal

        return apiResponse(res, {
            statusCode: 200,
            message: "Product added to cart successfully",
            data: finalCart
        });
    } catch (error) {
        throw new ApiError(500, error.message)
    }

});


// export const addToCart = asyncHandler(async (req, res) => {
//     const { productId, quantity } = req.body;
//     const user = req.user;

//     console.log(productId, quantity);

//     if (!productId || !quantity) {
//         throw new ApiError(400, "Product id and quantity are required");
//     }

//     if (quantity <= 0) {
//         throw new ApiError(400, "Quantity must be greater than 0");
//     }

//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//         throw new ApiError(404, "Product not found");
//     }

//     let cart = await Cart.findOne({ user: user._id });

//     console.log("Cart",cart)
//     // If cart doesn't exist, create a new one for the user
//     if (!cart) {
//         console.log("Hat 2")
//         cart = await Cart.create({
//             user: user._id,
//             products: [],
//             totalPrice: 0
//         });
//         console.log("Hat 3")
//     }

//     const existingItem = cart.products.find(item => item.product.toString() === productId);

//     if (existingItem) {
//         existingItem.quantity += parseInt(quantity);
//         existingItem.totalPrice = existingItem.price * existingItem.quantity;
//     } else {
//         // Add the product to the cart wiSth proper ObjectId reference
//         cart.products.push( productId,
//             // {
//             // product: productId, // This will be automatically cast to ObjectId by Mongoose
//             // quantity: parseInt(quantity),
//             // price: product.price,
//             // totalPrice: product.price * parseInt(quantity)
//         // }
//     );
//     }

//     cart.totalPrice = cart.products.reduce((total, item) => total + item.totalPrice, 0);

//     await cart.save();

//     return apiResponse(res, { statusCode: 200, message: "Product added to cart", data: cart });
// })


// Get cart items

export const getCartItems = asyncHandler(async (req, res) => {
    const user = req.user;
    try {

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        return apiResponse(res, { statusCode: 200, message: "Cart items fetched", data: cart });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Update cart item quantity

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        console.log("Item Id", itemId);
        console.log("Quantity", quantity);

        const user = req.user;

        if (!itemId || !quantity) {
            throw new ApiError(400, "Item id and quantity are required");
        }
        if (quantity <= 0) {
            throw new ApiError(400, "Quantity must be greater than 0");
        }
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        const itemExists = await CartProduct.findById(itemId);

        if (!itemExists) {
            throw new ApiError(404, "Cart product not found");
        }

        const updatedItem = await CartProduct.findByIdAndUpdate(
            itemId,
            {
                quantity,
                itemTotalPrice: itemExists.price * quantity
            },
            { new: true }
        );

        console.log("Updated Item", updatedItem);

        if (!updatedItem) {
            throw new ApiError(404, "Item not found");
        }

        const newTotalPrice = await recalculateCartTotal(cart?._id);

        return apiResponse(res, { statusCode: 200, message: "Cart item quantity updated", data: updatedItem });

    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Remove cart item

export const removeCartItem = asyncHandler(async (req, res) => {
    try {
        const { itemId } = req.params || req.body;

        const user = req.user;

        console.log("Item Id", itemId);

        if (!itemId) {
            throw new ApiError(400, "Item id is required");
        }

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        const itemExists = await CartProduct.findById(itemId);

        if (!itemExists) {
            throw new ApiError(404, "Cart product not found");
        }

        const cartProduct = await CartProduct.findByIdAndDelete(itemId);


        if (!cartProduct) {
            throw new ApiError(404, "Cart item not found");
        }
        await Cart.findByIdAndUpdate(cart?._id, { $pull: { products: itemId } });
        const newTotalPrice = await recalculateCartTotal(cart?._id);

        return apiResponse(res, { statusCode: 200, message: "Cart item removed", data: cartProduct });

    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Clear cart

export const clearCart = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        cart.products = [];

        cart.totalPrice = 0;

        await cart.save();

        return apiResponse(res, { statusCode: 200, message: "Cart cleared", data: cart });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Get cart total price

export const getCartTotalPrice = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        return apiResponse(res, { statusCode: 200, message: "Cart total price fetched", data: cart.totalPrice });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})