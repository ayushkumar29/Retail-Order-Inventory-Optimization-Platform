require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/products', productRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/orders', orderRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/reports', reportingRoutes);

// Error handling
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: `Path not found: ${req.originalUrl}` });
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const db = require('./config/db');

app.listen(PORT, async () => {
    console.log(`Retail Order & Inventory Analytics Platform server running on port ${PORT}`);
    console.log(`View the Frontend Application at: http://localhost:${PORT}`);
    console.log(`Backend API available at: http://localhost:${PORT}/products`);
    
    try {
        const connection = await db.getConnection();
        console.log('✅ Database connection verified successfully!');
        connection.release();
    } catch (err) {
        console.error('❌ Failed to connect to the database. Verify your .env settings.');
        console.error(err.message);
    }
});
