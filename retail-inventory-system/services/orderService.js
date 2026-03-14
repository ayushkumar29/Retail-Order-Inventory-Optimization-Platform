const db = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {
    async getAllOrders() {
        return await orderRepository.findAll();
    }


    async createOrder(orderData) {
        console.log(`[OrderService] Attempting to create order for ${orderData.customer_name} with ${orderData.items?.length || 0} items`);
        const { customer_name, items } = orderData;
        if (!customer_name || !items || items.length === 0) {
            const error = new Error('Customer name and items are required');
            error.statusCode = 400;
            throw error;
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Verify stock for all items BEFORE creating anything
            console.log('[OrderService] Activating Stock Validation Phase...');
            for (const item of items) {
                const { product_id, quantity } = item;
                
                if (quantity <= 0) {
                    console.error(`[OrderService Error] Validation failed: Product ID ${product_id} has invalid quantity ${quantity}.`);
                    const error = new Error(`Quantity must be greater than 0 for Product ID ${product_id}.`);
                    error.statusCode = 400;
                    throw error;
                }
                
                const inventory = await inventoryRepository.findByProductId(product_id, connection);
                
                if (!inventory) {
                    console.error(`[OrderService Error] Validation failed: Product ID ${product_id} not found.`);
                    const error = new Error(`Product ID ${product_id} not found in inventory`);
                    error.statusCode = 404;
                    throw error;
                }

                if (quantity > inventory.stock_quantity) {
                    console.error(`[OrderService Error] Stock-out prevented! Requested: ${quantity}, Available: ${inventory.stock_quantity} for Product ID ${product_id}`);
                    const error = new Error(`Insufficient stock for Product ID ${product_id}. Available: ${inventory.stock_quantity}, Requested: ${quantity}`);
                    error.statusCode = 400;
                    throw error;
                }
            }

            // 2. Create the order
            console.log(`[OrderService] Stock validated. Creating order header...`);
            const orderId = await orderRepository.createOrder(customer_name, connection);
            console.log(`[OrderService] Order created with ID: ${orderId}`);

            // 3. Process each item: create OrderItem and reduce Inventory
            console.log(`[OrderService] Processing ${items.length} items for Order ID: ${orderId}...`);
            for (const item of items) {
                const { product_id, quantity } = item;
                
                const product = await productRepository.findById(product_id);
                if (!product) {
                    throw new Error(`Product ID ${product_id} not found inside products table`);
                }

                // Add to OrderItems
                await orderRepository.createOrderItem(orderId, product_id, quantity, product.price, connection);

                // Reduce Inventory
                const reduced = await inventoryRepository.reduceStock(product_id, quantity, connection);
                if (!reduced) {
                    console.error(`[OrderService Error] Failed resolving stock allocation for Product ID ${product_id}.`);
                    throw new Error(`Failed to reduce stock for Product ID ${product_id}. Possibly due to concurrent updates.`);
                }
                console.log(`[OrderService] Successfully allocated ${quantity} units of Product ID ${product_id}.`);
            }

            console.log(`[OrderService] Order ${orderId} finalized. Committing database transaction...`);
            await connection.commit();
            return { message: 'Order created successfully', orderId };

        } catch (error) {
            console.error('[OrderService] Transaction Failed! Rolling back database changes...');
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

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

        console.log(`[OrderService] Manual status update requested for Order ID ${order_id} (New Status: ${status})`);
        
        const updated = await orderRepository.updateOrderStatus(order_id, status);
        if (!updated) {
            const error = new Error(`Order ID ${order_id} not found or status update failed`);
            error.statusCode = 404;
            throw error;
        }
        
        return { message: `Order status successfully updated to ${status}` };
    }

    async getCustomerOrderHistory(customer_name) {
        if (!customer_name) {
            const error = new Error('Customer name is required');
            error.statusCode = 400;
            throw error;
        }
        console.log(`[OrderService] Fetching order history for customer: ${customer_name}`);
        return await orderRepository.findOrdersByCustomer(customer_name);
    }

    async deleteOrder(order_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Note: If we had a requirement to restock upon deletion, we would do it here.
            // For now, pure deletion.
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

    async updateOrder(id, orderData) {
        if (!orderData.customer_name) {
            throw new Error('Customer name is required for update');
        }
        return await orderRepository.updateOrder(id, orderData.customer_name);
    }
}

module.exports = new OrderService();
