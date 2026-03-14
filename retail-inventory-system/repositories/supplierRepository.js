const db = require('../config/db');

class SupplierRepository {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM Suppliers');
        return rows;
    }

    async findById(supplier_id) {
        const [rows] = await db.query('SELECT * FROM Suppliers WHERE supplier_id = ?', [supplier_id]);
        return rows[0];
    }

    async create(supplierData) {
        const { supplier_name, contact_email } = supplierData;
        const [result] = await db.query(
            'INSERT INTO Suppliers (supplier_name, contact_email) VALUES (?, ?)',
            [supplier_name, contact_email]
        );
        return result.insertId;
    }

    async update(supplier_id, supplierData) {
        const { supplier_name, contact_email } = supplierData;
        const [result] = await db.query(
            'UPDATE Suppliers SET supplier_name = ?, contact_email = ? WHERE supplier_id = ?',
            [supplier_name, contact_email, supplier_id]
        );
        return result.affectedRows > 0;
    }

    async delete(supplier_id) {
        const [result] = await db.query('DELETE FROM Suppliers WHERE supplier_id = ?', [supplier_id]);
        return result.affectedRows > 0;
    }
}

module.exports = new SupplierRepository();
