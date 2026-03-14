const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const supplierRepository = require('../repositories/supplierRepository');
const db = require('../config/db');

class ProductService {
    // Get all products with supplier names
    async getAllProducts() {
        const [products, suppliers] = await Promise.all([
            productRepository.findAll(),
            supplierRepository.findAll()
        ]);

        const supplierMap = {};
        suppliers.forEach(s => supplierMap[s.supplier_id] = s.supplier_name);

        return products.map(p => ({
            ...p,
            supplier_name: supplierMap[p.supplier_id] || 'Unknown Supplier'
        }));
    }

    // Create new product with initial inventory
    async createProduct(productData) {
        if (!productData.name || !productData.price) {
            throw new Error('Product name and price are required');
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            const insertId = await productRepository.create(productData, connection);
            const initialStock = productData.initial_stock ? parseInt(productData.initial_stock, 10) : 0;
            await inventoryRepository.initializeStock(insertId, initialStock, connection);

            await connection.commit();
            return { message: 'Product created and inventory initialized successfully', productId: insertId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get top selling products
    async getTopProducts(limit) {
        const parsedLimit = parseInt(limit, 10) || 5;
        return await productRepository.getTopSellingProducts(parsedLimit);
    }

    // Update product details
    async updateProduct(id, productData) {
        if (!productData.name || !productData.price) {
            throw new Error('Product name and price are required');
        }
        
        const updated = await productRepository.update(id, productData);
        if (!updated) {
            const error = new Error(`Product ID ${id} not found`);
            error.statusCode = 404;
            throw error;
        }
        
        return updated;
    }

    // Delete product and associated inventory
    async deleteProduct(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query('DELETE FROM Inventory WHERE product_id = ?', [id]);
            
            const deleted = await productRepository.delete(id, connection);
            
            if (!deleted) {
                await connection.rollback();
                const error = new Error(`Product ID ${id} not found`);
                error.statusCode = 404;
                throw error;
            }
            
            await connection.commit();
            return deleted;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new ProductService();
