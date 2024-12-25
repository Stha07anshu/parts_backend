const path = require('path');
const productModel = require('../models/productModels');
const fs = require('fs');

// Create a new product
const createProduct = async (req, res) => {
    // Check incoming data
    console.log(req.body);
    console.log(req.files);

    // Destructuring incoming data
    const { productName, productPrice, productCategory, productDescription, productRating } = req.body;

    if (!productName || !productPrice || !productCategory || !productDescription || !productRating) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Check product image
    if (!req.files || !req.files.productImage) {
        return res.status(400).json({
            success: false,
            message: "Image not found!!"
        });
    }

    const { productImage } = req.files;

    // Uploading
    // 1. Generate unique name for each file
    const imageName = `${Date.now()}-${productImage.name}`;

    // 2. Define specific path
    const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`);

    // 3. Upload to that path
    try {
        await productImage.mv(imageUploadPath);

        // Save to database
        const newProduct = new productModel({
            productName,
            productPrice,
            productCategory,
            productDescription,
            productRating,
            productImage: imageName
        });

        const product = await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product Created!",
            data: product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

// Fetch all products
const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.status(200).json({
            success: true,
            message: "Products fetched successfully!",
            products: products
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Fetch a single product
const getProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        console.log('Fetching product with ID:', productId); // Debugging statement
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product Fetched!',
            product: product
        });
    } catch (error) {
        console.error('Error fetching product:', error); // Detailed error logging
        res.status(500).json({
            success: false,
            message: 'Server Error!',
            error: error.message
        });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await productModel.findByIdAndDelete(productId);

        if (product && product.productImage) {
            const oldImagePath = path.join(__dirname, `../public/products/${product.productImage}`);
            fs.unlinkSync(oldImagePath);
        }

        res.status(200).json({
            success: true,
            message: "Product Deleted!",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        if (req.files && req.files.productImage) {
            const { productImage } = req.files;

            const imageName = `${Date.now()}-${productImage.name}`;
            const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`);

            await productImage.mv(imageUploadPath);
            req.body.productImage = imageName;

            const existingProduct = await productModel.findById(req.params.id);

            if (existingProduct.productImage) {
                const oldImagePath = path.join(__dirname, `../public/products/${existingProduct.productImage}`);
                fs.unlinkSync(oldImagePath);
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: "Product Updated!",
            updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error
        });
    }
};

// Search products by productName
const searchProducts = async (req, res) => {
    const searchQuery = req.query.q;

    try {
        const products = await productModel.find({
            productName: { $regex: searchQuery, $options: 'i' }
        });

        res.status(200).json({
            success: true,
            message: "Search results fetched successfully!",
            products: products
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    searchProducts
};
