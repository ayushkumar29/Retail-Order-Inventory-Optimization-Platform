const reportingRepository = require('../repositories/reportingRepository');

class ReportingService {
    async getInventoryReport() {
        return await reportingRepository.getInventoryStatus();
    }

    async getSalesReport(startDate, endDate) {
        // Default to last 30 days if not provided
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return await reportingRepository.getDailySalesSummary(start, end);
    }

    async getProductPerformanceReport() {
        return await reportingRepository.getProductPerformance();
    }
}

module.exports = new ReportingService();
