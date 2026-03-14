const db = require('../config/db');

class InventoryRepository {
    async findAll() {
        const [rows] = await db.query(`
            SELECT * FROM Inventory
        `);
        return rows;
    }

    async findByProductId(product_id, connection = db) {
        const [rows] = await connection.query(
            'SELECT * FROM Inventory WHERE product_id = ?',
            [product_id]
        );
        return rows[0];
    }

    async findLowStock(threshold = 10) {
        const [rows] = await db.query(`
            SELECT * FROM Inventory
            WHERE stock_quantity <= ?
            ORDER BY stock_quantity ASC
        `, [threshold]);
        return rows;
    }

    async updateStock(product_id, quantity) {
        const [result] = await db.query(
            'UPDATE Inventory SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
            [quantity, product_id]
        );
        return result.affectedRows > 0;
    }

    async reduceStock(product_id, quantity, connection = db) {
        const [result] = await connection.query(
            'UPDATE Inventory SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?',
            [quantity, product_id, quantity]
        );
        return result.affectedRows > 0;
    }

    async initializeStock(product_id, quantity, connection = db) {
        const [result] = await connection.query(
            'INSERT INTO Inventory (product_id, stock_quantity, warehouse_location) VALUES (?, ?, ?)',
            [product_id, quantity, 'Main Warehouse'] // Default to a Main Warehouse
        );
        return result.insertId;
    }
}

module.exports = new InventoryRepository();
