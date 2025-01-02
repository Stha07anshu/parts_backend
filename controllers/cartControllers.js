const cron = require("node-cron");
const Cart = require("../models/CartModels");
const Product = require("../models/productModels"); // Assuming a Product model exists

// Add a product to the cart
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Product ID and valid quantity are required",
        });
    }

    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if product is in stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            // If no cart exists, create a new one
            cart = new Cart({
                user: req.user.id,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (existingItem) {
            // Update quantity if product already exists in cart
            existingItem.quantity += quantity;
        } else {
            // Add new product to cart
            cart.items.push({
                productId,
                quantity,
                productName: product.productName,
                productPrice: product.productPrice,
                productImage: product.productImage,
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get the user's cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart is empty",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Update the quantity of a product in the cart
const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
        return res.status(400).json({
            success: false,
            message: "Product ID and valid quantity are required",
        });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        if (quantity === 0) {
            // Remove item from cart if quantity is set to 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Update the quantity of the product
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Clear the user's cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Cron job to clear abandoned carts (example every 24 hours)
cron.schedule("0 0 * * *", async () => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 30); // 30 days ago

    await Cart.updateMany(
        { updatedAt: { $lt: expirationDate }, items: { $exists: true, $size: 0 } },
        { $set: { items: [] } }
    );
    console.log("Expired carts cleared.");
});

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    clearCart,
};
