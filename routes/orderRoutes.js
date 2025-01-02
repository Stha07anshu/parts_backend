const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/orderControllers');
const { authGuard, adminGuard } = require('../middleware/authGuard')

// Route to create a new order
router.post('/orders', authGuard ,orderControllers.createOrder);

// Route to get all orders for the logged-in user
router.get('/get_all_orders', adminGuard ,orderControllers.getAllOrders);

// Route to get a single order by ID for the logged-in user
router.get('/get_single_product/:id', authGuard, orderControllers.getSingleOrder);

// Route to update an order
router.put('/update_orders/:id', authGuard, orderControllers.updateOrder);

// Route to delete an order
router.delete('/delete_orders/:id', authGuard, orderControllers.deleteOrder);

module.exports = router;
