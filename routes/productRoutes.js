const router = require('express').Router()
const productControllers = require('../controllers/productControllers')
const { authGuard, adminGuard } = require('../middleware/authGuard')
// Make a create product API
router.post('/create',productControllers.createProduct)

// fetch all
// http://localhost:5000/api/product/get_all_products
router.get('/get_all_products', productControllers.getAllProducts)

// fetch single product
// If POST, body(data)
router.get('/get_single_product/:id',authGuard, productControllers.getProduct)

// delete Product
router.delete('/delete_product/:id',adminGuard, productControllers.deleteProduct)

// update product
router.put('/update_product/:id',adminGuard, productControllers.updateProduct)

router.get('/search', productControllers.searchProducts);

// exporting
module.exports = router;
