const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');

router.get('/inventory', reportingController.getInventoryReport);
router.get('/sales', reportingController.getSalesReport);
router.get('/performance', reportingController.getProductPerformanceReport);

module.exports = router;
