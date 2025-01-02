const express = require('express');
const router = express.Router();
const cartControllers = require('../controllers/cartControllers');
const { authGuard, adminGuard } = require('../middleware/authGuard')

// Route to create a new order
router.post('/carts', authGuard ,cartControllers.addToCart);

// Route to get all orders for the logged-in user
router.get('/get_all_carts', adminGuard ,cartControllers.getCart);

// Route to update an order
router.put('/update_carts/:id', authGuard, cartControllers.updateCartItem);

// Route to delete an order
router.delete('/delete_carts/:id', authGuard, cartControllers.clearCart);

module.exports = router;
