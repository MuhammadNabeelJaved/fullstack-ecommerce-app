import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Cloudinary from "../utils/Cloudinary.js";


// Create product

export const createProduct = asyncHandler(async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const images = req.files.map(file => file.path);

        if (!images || images.length === 0) {
            throw new ApiError("At least one image is required", 400);
        }


        if (!name || !description || !price || !category || !stock) {
            throw new ApiError("All fields are required", 400);
        }

        if (price <= 0 || stock < 0) {
            throw new ApiError("Price and stock must be positive", 400);
        }

        if (category !== "electronics" && category !== "fashion" && category !== "home" && category !== "sports" && category !== "books" && category !== "other") {
            throw new ApiError("Invalid category", 400);
        }

        const uploadedImages = await Promise.all(images.map(async (image) => {
            const result = await Cloudinary.uploadImage(image);
            return result.secure_url;
        }));



        const productData = {
            name,
            description,
            price,
            category,
            stock,
            images: uploadedImages
        }

        const product = await Product.create(productData);

        if (!product) {
            throw new ApiError("Failed to create product", 500);
        }

        return new ApiResponse(res, { statusCode: 201, message: "Product created successfully", data: product });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Get all products

export const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();

        if (!products) {
            throw new ApiError("No products found", 404);
        }

        return new ApiResponse(res, { statusCode: 200, message: "Products fetched successfully", data: products });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// Update product

export const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        const images = req.files.map(file => file.path);

        if (!images || images.length === 0) {
            throw new ApiError("At least one image is required", 400);
        }

        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError("Product not found", 404);
        }

        const uploadedImages = await Promise.all(images.map(async (image) => {
            const result = await Cloudinary.uploadImage(image);
            return result.secure_url;
        }));

        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.stock = stock;
        product.images = uploadedImages;

        await product.save();

        return new ApiResponse(res, { statusCode: 200, message: "Product updated successfully", data: product });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})


// delete product

export const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError("Product not found", 404);
        }

        await product.deleteOne();

        return new ApiResponse(res, { statusCode: 200, message: "Product deleted successfully" });

    } catch (error) {
        throw new ApiError(error.message, 500);
    }
})

// Get product by id

// export const getProductById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;

//         const product = await Product.findById(id);

//         if (!product) {
//             throw new ApiError("Product not found", 404);
//         }

//         return new ApiResponse(res, { statusCode: 200, message: "Product fetched successfully", data: product });

//     } catch (error) {
//         throw new ApiError(error.message, 500);
//     }
// })

