const db = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {
    // Get all orders with items
    async getAllOrders() {
        return await orderRepository.findAll();
    }

    // Create new order with stock validation
    async createOrder(orderData) {
        const { customer_name, items } = orderData;
        if (!customer_name || !items || items.length === 0) {
            const error = new Error('Customer name and items are required');
            error.statusCode = 400;
            throw error;
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            for (const item of items) {
                const { product_id, quantity } = item;
                
                if (quantity <= 0) {
                    const error = new Error(`Quantity must be greater than 0 for Product ID ${product_id}.`);
                    error.statusCode = 400;
                    throw error;
                }
                
                const inventory = await inventoryRepository.findByProductId(product_id, connection);
                
                if (!inventory) {
                    const error = new Error(`Product ID ${product_id} not found in inventory`);
                    error.statusCode = 404;
                    throw error;
                }

                if (quantity > inventory.stock_quantity) {
                    const error = new Error(`Insufficient stock for Product ID ${product_id}. Available: ${inventory.stock_quantity}, Requested: ${quantity}`);
                    error.statusCode = 400;
                    throw error;
                }
            }

            const orderId = await orderRepository.createOrder(customer_name, connection);

            for (const item of items) {
                const { product_id, quantity } = item;
                
                const product = await productRepository.findById(product_id);
                if (!product) {
                    throw new Error(`Product ID ${product_id} not found inside products table`);
                }

                await orderRepository.createOrderItem(orderId, product_id, quantity, product.price, connection);
                const reduced = await inventoryRepository.reduceStock(product_id, quantity, connection);
                if (!reduced) {
                    throw new Error(`Failed to reduce stock for Product ID ${product_id}. Possibly due to concurrent updates.`);
                }
            }

            await connection.commit();
            return { message: 'Order created successfully', orderId };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update order status with validation
    async updateOrderStatus(order_id, status) {
        if (!order_id || !status) {
            const error = new Error('Order ID and status are required');
            error.statusCode = 400;
            throw error;
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            const error = new Error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        const updated = await orderRepository.updateOrderStatus(order_id, status);
        if (!updated) {
            const error = new Error(`Order ID ${order_id} not found or status update failed`);
            error.statusCode = 404;
            throw error;
        }
        
        return { message: `Order status successfully updated to ${status}` };
    }

    // Get order history for specific customer
    async getCustomerOrderHistory(customer_name) {
        if (!customer_name) {
            const error = new Error('Customer name is required');
            error.statusCode = 400;
            throw error;
        }
        return await orderRepository.findOrdersByCustomer(customer_name);
    }

    // Delete order and associated items
    async deleteOrder(order_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const deleted = await orderRepository.delete(order_id, connection);
            
            if (!deleted) {
                await connection.rollback();
                const error = new Error(`Order ID ${order_id} not found`);
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

    // Update order customer name
    async updateOrder(id, orderData) {
        if (!orderData.customer_name) {
            throw new Error('Customer name is required for update');
        }
        return await orderRepository.updateOrder(id, orderData.customer_name);
    }
}

module.exports = new OrderService();
