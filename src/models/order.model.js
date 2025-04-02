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
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
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


orderSchema.methods.genrateOrderNumber = function () {
    const prefix = "ORD"
    const randomNumber = Math.floor(100000 + Math.random() * 900000)

    const orderNumber = `${prefix}-${randomNumber}`

    if (this.isModified("orderNumber")) {
        return orderNumber
    }
    this.orderNumber = orderNumber
    return orderNumber
}



const Order = model("Order", orderSchema)
export default Order
