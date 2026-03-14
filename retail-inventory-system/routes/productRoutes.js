const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.use((req, res, next) => {
    console.log(`[ProductRouter Debug] ${req.method} ${req.url}`);
    next();
});


router.get('/', productController.getProducts);
router.get('/top', productController.getTopProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
