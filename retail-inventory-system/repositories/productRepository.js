const db = require('../config/db');

class ProductRepository {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM Products');
        return rows;
    }

    async create(product, connection = db) {
        const { name, category, price, supplier_id } = product;
        const [result] = await connection.query(
            'INSERT INTO Products (name, category, price, supplier_id) VALUES (?, ?, ?, ?)',
            [name, category, price, supplier_id]
        );
        return result.insertId;
    }

    async findById(product_id) {
        const [rows] = await db.query('SELECT * FROM Products WHERE product_id = ?', [product_id]);
        return rows[0];
    }

    async getTopSellingProducts(limit = 5) {
        const [rows] = await db.query(`
            SELECT p.product_id, p.name, p.category, SUM(oi.quantity) as total_sold
            FROM Products p
            JOIN OrderItems oi ON p.product_id = oi.product_id
            JOIN Orders o ON oi.order_id = o.order_id
            WHERE o.status != 'Cancelled'
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }

    async update(product_id, data) {
        const { name, category, price, supplier_id } = data;
        const [result] = await db.query(
            'UPDATE Products SET name = ?, category = ?, price = ?, supplier_id = ? WHERE product_id = ?',
            [name, category, price, supplier_id, product_id]
        );
        return result.affectedRows > 0;
    }

    async delete(product_id, connection = db) {
        const [result] = await connection.query('DELETE FROM Products WHERE product_id = ?', [product_id]);
        return result.affectedRows > 0;
    }
}

module.exports = new ProductRepository();
