import mongoose, { Schema, model } from 'mongoose';

const cartProductSchema = new Schema({
    cart: { // Reference to the parent Cart document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
        index: true // Good to index for lookups by cart
    },
    product: { // Reference to the actual Product document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    price: { // Price of the product WHEN IT WAS ADDED
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    itemTotalPrice: { // Total price for this specific item line (price * quantity)
        type: Number,
        required: true,
        min: [0, 'Item total price cannot be negative']
    }
    // No timestamps needed here usually, the Cart's timestamps are often sufficient
}, {
    // Optional: Add a compound index if you frequently query by cart AND product
    // index: { cart: 1, product: 1 }, // Consider if needed for performance
});

// Ensure unique combination of cart and product within it
cartProductSchema.index({ cart: 1, product: 1 }, { unique: true });

const CartProduct = model("CartProduct", cartProductSchema);

export default CartProduct;