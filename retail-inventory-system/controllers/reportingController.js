const reportingService = require('../services/reportingService');

class ReportingController {
    async getInventoryReport(req, res, next) {
        try {
            const report = await reportingService.getInventoryReport();
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async getSalesReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportingService.getSalesReport(startDate, endDate);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async getProductPerformanceReport(req, res, next) {
        try {
            const report = await reportingService.getProductPerformanceReport();
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReportingController();
