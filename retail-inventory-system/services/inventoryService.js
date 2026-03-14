const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');

class InventoryService {
    async getInventory() {
        console.log('[InventoryService] Fetching inventory list and merging with product names');
        const [inventory, products] = await Promise.all([
            inventoryRepository.findAll(),
            productRepository.findAll()
        ]);
        
        const productMap = {};
        products.forEach(p => productMap[p.product_id] = p.name);
        
        return inventory.map(item => ({
            ...item,
            product_name: productMap[item.product_id] || 'Unknown Product'
        }));
    }

    async getLowStock(threshold) {
        const parsedThreshold = parseInt(threshold, 10) || 10;
        console.log(`[InventoryService] Fetching low stock items and merging names (threshold: <= ${parsedThreshold})`);
        
        const [lowStock, products] = await Promise.all([
            inventoryRepository.findLowStock(parsedThreshold),
            productRepository.findAll()
        ]);

        const productMap = {};
        products.forEach(p => productMap[p.product_id] = p.name);
        
        return lowStock.map(item => ({
            ...item,
            product_name: productMap[item.product_id] || 'Unknown Product'
        }));
    }

    async updateInventory(product_id, delta) {
        console.log(`[InventoryService] Manual stock adjustment requested for Product ID ${product_id} (Delta: ${delta})`);
        if (product_id === undefined || delta === undefined) {
            throw new Error('Product ID and quantity delta are required');
        }

        // Fetch current stock to prevent negative inventory if subtracting
        const currentItem = await inventoryRepository.findByProductId(product_id);
        if (!currentItem) {
            throw new Error('Product not found in inventory');
        }

        const newStock = currentItem.stock_quantity + delta;
        if (newStock < 0) {
            throw new Error(`Insufficient stock. Current: ${currentItem.stock_quantity}, Adjustment: ${delta}`);
        }

        const updated = await inventoryRepository.updateStock(product_id, delta);
        if (!updated) {
            throw new Error('Inventory update failed');
        }
        return { message: 'Inventory updated successfully', newQuantity: newStock };
    }
}

module.exports = new InventoryService();
