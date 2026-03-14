const db = require('../config/db');

class OrderRepository {
    async findAll() {
        const [rows] = await db.query(`
            SELECT o.*, oi.product_id, oi.quantity, oi.price, (oi.quantity * oi.price) AS total_price
            FROM Orders o
            LEFT JOIN OrderItems oi ON o.order_id = oi.order_id
            ORDER BY o.order_date DESC
        `);
        return rows;
    }

    async createOrder(customer_name, connection = db) {
        const [result] = await connection.query(
            'INSERT INTO Orders (customer_name, status) VALUES (?, ?)',
            [customer_name, 'Pending']
        );
        return result.insertId;
    }

    async createOrderItem(order_id, product_id, quantity, price, connection = db) {
        const [result] = await connection.query(
            'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, price]
        );
        return result.insertId;
    }

    async updateOrderStatus(order_id, status) {
        const [result] = await db.query(
            'UPDATE Orders SET status = ? WHERE order_id = ?',
            [status, order_id]
        );
        return result.affectedRows > 0;
    }

    async findOrdersByCustomer(customer_name) {
        const [orders] = await db.query(
            'SELECT * FROM Orders WHERE customer_name = ? ORDER BY order_date DESC',
            [customer_name]
        );
        
        if (orders.length === 0) return [];

        const orderIds = orders.map(o => o.order_id);
        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name 
            FROM OrderItems oi 
            JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id IN (?)
        `, [orderIds]);

        orders.forEach(order => {
            order.items = items.filter(item => item.order_id === order.order_id);
        });

        return orders;
    }

    async delete(order_id, connection = db) {
        await connection.query('DELETE FROM OrderItems WHERE order_id = ?', [order_id]);
        const [result] = await connection.query('DELETE FROM Orders WHERE order_id = ?', [order_id]);
        return result.affectedRows > 0;
    }

    async updateOrder(order_id, customer_name) {
        const [result] = await db.query(
            'UPDATE Orders SET customer_name = ? WHERE order_id = ?',
            [customer_name, order_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new OrderRepository();
