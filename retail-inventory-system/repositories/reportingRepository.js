const db = require('../config/db');

class ReportingRepository {
    async getInventoryStatus() {
        const [rows] = await db.query('SELECT * FROM View_InventoryStatus');
        return rows;
    }

    async getDailySalesSummary(startDate, endDate) {
        const [results] = await db.query('CALL sp_GetDailySalesSummary(?, ?)', [startDate, endDate]);
        return results[0];
    }

    async getProductPerformance() {
        const [results] = await db.query('CALL sp_GetProductPerformance()');
        return results[0];
    }
}

module.exports = new ReportingRepository();
