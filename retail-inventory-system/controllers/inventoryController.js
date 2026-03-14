const inventoryService = require('../services/inventoryService');

class InventoryController {
    async getInventory(req, res, next) {
        try {
            const inventory = await inventoryService.getInventory();
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            next(error);
        }
    }

    async getLowStock(req, res, next) {
        try {
            const threshold = req.query.threshold;
            const lowStock = await inventoryService.getLowStock(threshold);
            res.status(200).json({ success: true, data: lowStock });
        } catch (error) {
            next(error);
        }
    }

    async updateInventory(req, res, next) {
        try {
            // Expecting body like { "productId": 1, "stockQuantity": 50 }
            const { productId, stockQuantity } = req.body;
            const result = await inventoryService.updateInventory(productId, stockQuantity);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryController();
