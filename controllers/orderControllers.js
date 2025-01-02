const cron = require("node-cron");
const Order = require("../models/orderModels");
const Product = require("../models/productModels"); // Assuming a Product model exists

// Create a new order
const createOrder = async (req, res) => {
    const { products, totalAmount, paymentMethod } = req.body;

    // Validate the required fields
    if (!products || !totalAmount || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const productDetails = [];
        let calculatedTotalAmount = 0;

        for (let product of products) {
            const { productId, quantity } = product;

            // Fetch product details using productId
            const productData = await Product.findById(productId);

            if (!productData) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${productId} not found`
                });
            }

            const productWithDetails = {
                productId,
                productName: productData.productName,
                productPrice: productData.productPrice,
                productImage: productData.productImage,
                quantity,
                totalProductPrice: productData.productPrice * quantity
            };

            productDetails.push(productWithDetails);
            calculatedTotalAmount += productWithDetails.totalProductPrice;
        }

        const newOrder = new Order({
            user: req.user.id,
            products: productDetails,
            totalAmount: calculatedTotalAmount,
            paymentMethod,
            status: "Pending",
        });

        const order = await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get all orders for the logged-in user
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate(
            "products.productId",
            "productName productImage"
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user"
            });
        }

        res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            data: orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get a single order by ID for the logged-in user
const getSingleOrder = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required"
        });
    }

    try {
        const order = await Order.findOne({ _id: id, user: req.user.id }).populate(
            "products.productId",
            "productName productImage productDescription"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not authorized"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Update an order (e.g., update status)
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, user: req.user.id },
            updateData,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not authorized"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Delete an order for the logged-in user
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedOrder = await Order.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not authorized"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Function to automatically update order status
const updateOrderStatusToShipped = async () => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Find orders that are still "Pending" and created over 24 hours ago
        const ordersToUpdate = await Order.updateMany(
            { status: "Pending", createdAt: { $lte: twentyFourHoursAgo } },
            { status: "Shipped" }
        );

        console.log(`Updated ${ordersToUpdate.modifiedCount} orders to 'Shipped'`);
    } catch (error) {
        console.error("Error updating order status:", error.message);
    }
};

// Schedule the cron job to run every hour
cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled job to update order statuses...");
    await updateOrderStatusToShipped();
});

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrder,
    deleteOrder,
};
