const db = require('../config/db');

class ReportingRepository {
    async getInventoryStatus() {
        console.log('[ReportingRepository] Executing query on View_InventoryStatus');
        const [rows] = await db.query('SELECT * FROM View_InventoryStatus');
        return rows;
    }

    async getDailySalesSummary(startDate, endDate) {
        console.log(`[ReportingRepository] Calling sp_GetDailySalesSummary(${startDate}, ${endDate})`);
        const [results] = await db.query('CALL sp_GetDailySalesSummary(?, ?)', [startDate, endDate]);
        // MySQL stored procedure call returns an array where the first element is the rowset
        return results[0];
    }

    async getProductPerformance() {
        console.log('[ReportingRepository] Calling sp_GetProductPerformance()');
        const [results] = await db.query('CALL sp_GetProductPerformance()');
        return results[0];
    }
}

module.exports = new ReportingRepository();
