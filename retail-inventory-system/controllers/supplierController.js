const supplierService = require('../services/supplierService');

class SupplierController {
    async getSuppliers(req, res, next) {
        try {
            const suppliers = await supplierService.getAllSuppliers();
            res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }

    async getSupplier(req, res, next) {
        try {
            const supplier = await supplierService.getSupplierById(req.params.id);
            res.status(200).json({ success: true, data: supplier });
        } catch (error) {
            next(error);
        }
    }

    async createSupplier(req, res, next) {
        try {
            const result = await supplierService.createSupplier(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateSupplier(req, res, next) {
        try {
            const result = await supplierService.updateSupplier(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteSupplier(req, res, next) {
        try {
            const result = await supplierService.deleteSupplier(req.params.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SupplierController();
