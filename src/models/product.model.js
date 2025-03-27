import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ["electronics", "fashion", "home", "sports", "books", "other"]
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [{
        public_id: String,
        url: String
    }],
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
            default: 0
        },
        comment: {
            type: String,
            required: true
        }
    }],

}, { timestamps: true })

const Product = model("Product", productSchema)

export default Product
