const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventory);
router.get('/low-stock', inventoryController.getLowStock);
router.put('/update', inventoryController.updateInventory);

module.exports = router;
