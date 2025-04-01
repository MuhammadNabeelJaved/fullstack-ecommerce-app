import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Array of references to the CartProduct documents
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartProduct' // Reference the new model
    }],
    // We still store the total price on the cart for quick access
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Cart total price cannot be negative']
    },

}, { timestamps: true })

const Cart = model("Cart", cartSchema)

export default Cart

