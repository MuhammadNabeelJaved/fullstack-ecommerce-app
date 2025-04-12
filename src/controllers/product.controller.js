import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Cloudinary from "../utils/Cloudinary.js";


// Create product

export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    console.log("Body Data", req.body);
    try {
        // const images = req.files.map(file => file.path);
        const image = req?.file?.path;

        console.log("Image Data", image);


        if (!image) {
            throw new ApiError(400,"At least one image is required");
        }


        if (!name || !description || !price || !category || !stock) {
            throw new ApiError(400,"All fields are required");
        }

        if (price <= 0 || stock < 0) {
            throw new ApiError(400,"Price and stock must be positive");
        }

        if (category !== "electronics" && category !== "fashion" && category !== "home" && category !== "sports" && category !== "books" && category !== "other") {
            throw new ApiError(400,"Invalid category" );
        }

        const uploadedImages = await Cloudinary.uploadImage(image);

        if (!uploadedImages) {
            throw new ApiError(500,"Failed to upload images to cloudinary");
        }


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
            throw new ApiError(500,"Failed to create product");
        }

        return apiResponse(res, { statusCode: 201, message: "Product created successfully", data: product });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Get all products

export const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();

        if (!products) {
            throw new ApiError("No products found", 404);
        }

        return apiResponse(res, { statusCode: 200, message: "Products fetched successfully", data: products });
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})


// Update product

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    console.log(name, id);
    // if (!name || !description || !price || !category || !stock) {
    //     throw new ApiError("All fields are required", 400);
    // }
    try {


        // if (price <= 0 || stock < 0) {
        //     throw new ApiError("Price and stock must be positive", 400);
        // }
        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            throw new ApiError("Product not found", 404);
        }

        // Handle image upload if files are present
        let uploadedImages = product.images; // Default to existing images

        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => file.path);

            // Delete old images from cloudinary
            const deletedImages = await Cloudinary.deleteImage(product.images);
            if (!deletedImages) {
                throw new ApiError("Failed to delete images from cloudinary", 500);
            }

            // Upload new images
            uploadedImages = await Promise.all(images.map(async (image) => {
                const result = await Cloudinary.uploadImage(image);
                return result;
            }));

            if (!uploadedImages) {
                throw new ApiError("Failed to upload images to cloudinary", 500);
            }
        }

        // Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;
        product.images = uploadedImages;

        // Save updated product
        const updatedProduct = await product.save();

        if (!updatedProduct) {
            throw new ApiError("Failed to update product", 500);
        }

        return apiResponse(res, {
            statusCode: 200,
            message: `Product updated successfully`,
            data: updatedProduct
        });
    } catch (error) {
        throw new ApiError(500, error.message)
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

        const deletedImages = await Cloudinary.deleteImage(product.images);
        if (!deletedImages) {
            throw new ApiError("Failed to delete images from cloudinary", 500);
        }

        await product.deleteOne();

        return apiResponse(res, { statusCode: 200, message: "Product deleted successfully" });

    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

// Get product by id

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {

        if (!id) {
            throw new ApiError("Product id is required", 400);
        }

        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError("Product not found", 404);
        }

        return apiResponse(res, { statusCode: 200, message: "Product fetched successfully", data: product });

    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

