const orderService = require('../services/orderService');

class OrderController {
    async getOrders(req, res, next) {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }

    async createOrder(req, res, next) {
        try {
            const result = await orderService.createOrder(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await orderService.updateOrderStatus(id, status);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getOrderHistory(req, res, next) {
        try {
            const { customer_name } = req.params;
            const history = await orderService.getCustomerOrderHistory(customer_name);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    async updateOrder(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await orderService.updateOrder(id, req.body);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteOrder(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await orderService.deleteOrder(id);
            res.status(200).json({ success: true, data: deleted });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
