const supplierRepository = require('../repositories/supplierRepository');

class SupplierService {
    async getAllSuppliers() {
        return await supplierRepository.findAll();
    }

    async getSupplierById(id) {
        const supplier = await supplierRepository.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }
        return supplier;
    }

    async createSupplier(supplierData) {
        if (!supplierData.supplier_name) {
            throw new Error('Supplier name is required');
        }
        const insertId = await supplierRepository.create(supplierData);
        return { message: 'Supplier created successfully', supplierId: insertId };
    }

    async updateSupplier(id, supplierData) {
        const success = await supplierRepository.update(id, supplierData);
        if (!success) {
            throw new Error('Supplier not found or no changes made');
        }
        return { message: 'Supplier updated successfully' };
    }

    async deleteSupplier(id) {
        const success = await supplierRepository.delete(id);
        if (!success) {
            throw new Error('Supplier not found');
        }
        return { message: 'Supplier deleted successfully' };
    }
}

module.exports = new SupplierService();
