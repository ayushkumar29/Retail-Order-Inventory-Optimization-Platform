const productService = require('../services/productService');

class ProductController {
    async getProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            next(error);
        }
    }

    async createProduct(req, res, next) {
        try {
            const result = await productService.createProduct(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTopProducts(req, res, next) {
        try {
            const limit = req.query.limit; 
            const topProducts = await productService.getTopProducts(limit);
            res.status(200).json({ success: true, data: topProducts });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await productService.updateProduct(id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await productService.deleteProduct(id);
            res.status(200).json({ success: true, data: deleted });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
