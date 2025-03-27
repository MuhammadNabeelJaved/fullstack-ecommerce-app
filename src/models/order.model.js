import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["cash", "card", "upi"]
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["pending", "paid", "failed"]
    },
    shippingAddress: {
        type: String,
        required: true
    },
    shippingStatus: {
        type: String,
        required: true,
        enum: ["pending", "shipped", "delivered", "cancelled"]
    },
    orderDate: {
        type: Date,
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    },

}, { timestamps: true })

const Order = model("Order", orderSchema)
export default Order
