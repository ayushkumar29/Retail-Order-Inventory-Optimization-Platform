require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    let connection;
    try {
        console.log('🚀 Starting Retail Inventory System Database Setup...\n');

        // Step 1: Connect to MySQL (without database first)
        console.log('📡 Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'retail_inventory';
        console.log(`✅ Connected to MySQL server`);
        console.log(`📁 Target database: ${dbName}\n`);

        // Step 2: Create database if it doesn't exist
        console.log('🏗️  Creating database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        console.log(`✅ Database '${dbName}' ready\n`);

        // Step 3: Create tables manually in correct order
        console.log('📋 Creating database schema...');
        
        // Disable foreign key checks during setup
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        try {
            // Drop tables in reverse dependency order
            console.log('   🗑️  Dropping existing tables...');
            await connection.query('DROP TABLE IF EXISTS OrderItems');
            await connection.query('DROP TABLE IF EXISTS Orders');
            await connection.query('DROP TABLE IF EXISTS Inventory');
            await connection.query('DROP TABLE IF EXISTS Products');
            await connection.query('DROP TABLE IF EXISTS Suppliers');
            
            // Create tables in dependency order
            console.log('   ✅ Creating suppliers table...');
            await connection.query(`
                CREATE TABLE Suppliers (
                    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
                    supplier_name VARCHAR(255) NOT NULL,
                    contact_email VARCHAR(255)
                )
            `);
            
            console.log('   ✅ Creating products table...');
            await connection.query(`
                CREATE TABLE Products (
                    product_id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(255),
                    price DECIMAL(10, 2) NOT NULL,
                    supplier_id INT,
                    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE SET NULL
                )
            `);
            
            console.log('   ✅ Creating inventory table...');
            await connection.query(`
                CREATE TABLE Inventory (
                    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    stock_quantity INT DEFAULT 0,
                    warehouse_location VARCHAR(255),
                    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
                )
            `);
            
            console.log('   ✅ Creating orders table...');
            await connection.query(`
                CREATE TABLE Orders (
                    order_id INT AUTO_INCREMENT PRIMARY KEY,
                    customer_name VARCHAR(255) NOT NULL,
                    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'Pending'
                )
            `);
            
            console.log('   ✅ Creating order items table...');
            await connection.query(`
                CREATE TABLE OrderItems (
                    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
                )
            `);
            
            // Create indexes
            console.log('   ✅ Creating performance indexes...');
            await connection.query('CREATE INDEX idx_products_category ON Products(category)');
            await connection.query('CREATE INDEX idx_orders_status ON Orders(status)');
            await connection.query('CREATE INDEX idx_orders_date ON Orders(order_date)');
            await connection.query('CREATE INDEX idx_inventory_stock ON Inventory(stock_quantity)');
            
            // Create views
            console.log('   ✅ Creating reporting views...');
            await connection.query(`
                CREATE OR REPLACE VIEW View_InventoryStatus AS
                SELECT 
                    i.inventory_id,
                    p.product_id,
                    p.name AS product_name,
                    p.category,
                    s.supplier_name,
                    i.stock_quantity,
                    i.warehouse_location,
                    CASE 
                        WHEN i.stock_quantity = 0 THEN 'Out of Stock'
                        WHEN i.stock_quantity < 10 THEN 'Low Stock'
                        ELSE 'In Stock'
                    END AS stock_status
                FROM Inventory i
                JOIN Products p ON i.product_id = p.product_id
                LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
            `);
            
            await connection.query(`
                CREATE OR REPLACE VIEW View_SalesDetails AS
                SELECT 
                    o.order_id,
                    o.customer_name,
                    o.order_date,
                    o.status AS order_status,
                    oi.order_item_id,
                    p.name AS product_name,
                    p.category,
                    oi.quantity,
                    oi.price AS unit_price,
                    (oi.quantity * oi.price) AS line_total
                FROM Orders o
                JOIN OrderItems oi ON o.order_id = oi.order_id
                JOIN Products p ON oi.product_id = p.product_id
            `);
            
            // Create stored procedures
            console.log('   ✅ Creating stored procedures...');
            try {
                await connection.query('DROP PROCEDURE IF EXISTS sp_GetDailySalesSummary');
                await connection.query(`
                    CREATE PROCEDURE sp_GetDailySalesSummary(IN startDate DATE, IN endDate DATE)
                    BEGIN
                        SELECT 
                            DATE(order_date) AS sale_date,
                            COUNT(DISTINCT order_id) AS total_orders,
                            SUM(line_total) AS total_revenue,
                            SUM(quantity) AS total_items_sold
                        FROM View_SalesDetails
                        WHERE DATE(order_date) BETWEEN startDate AND endDate
                        AND order_status != 'Cancelled'
                        GROUP BY DATE(order_date)
                        ORDER BY sale_date DESC;
                    END
                `);
            } catch (error) {
                console.log('   ⏭️  Daily sales procedure skipped');
            }
            
            try {
                await connection.query('DROP PROCEDURE IF EXISTS sp_GetProductPerformance');
                await connection.query(`
                    CREATE PROCEDURE sp_GetProductPerformance()
                    BEGIN
                        SELECT 
                            product_name,
                            category,
                            SUM(quantity) AS total_quantity_sold,
                            SUM(line_total) AS total_revenue,
                            COUNT(DISTINCT order_id) AS order_occurrence
                        FROM View_SalesDetails
                        WHERE order_status != 'Cancelled'
                        GROUP BY product_name, category
                        ORDER BY total_revenue DESC;
                    END
                `);
            } catch (error) {
                console.log('   ⏭️  Product performance procedure skipped');
            }
            
        } finally {
            // Re-enable foreign key checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        }
        
        console.log('✅ Database schema created\n');

        // Step 4: Clear existing data
        console.log('🧹 Clearing existing data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        try {
            await connection.query('TRUNCATE TABLE OrderItems');
            await connection.query('TRUNCATE TABLE Orders');
            await connection.query('TRUNCATE TABLE Inventory');
            await connection.query('TRUNCATE TABLE Products');
            await connection.query('TRUNCATE TABLE Suppliers');
            console.log('✅ Existing data cleared');
        } catch (error) {
            console.log('⏭️  Data clearing skipped');
        }
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('');

        // Step 5: Insert sample data
        console.log('📦 Inserting sample data...');

        // Insert Suppliers
        console.log('   🏢 Adding suppliers...');
        await connection.query(`
            INSERT INTO Suppliers (supplier_name, contact_email) VALUES
            ('TechGiant', 'sales@techgiant.com'),
            ('CozyHome Furniture', 'orders@cozyhome.com'),
            ('ActiveWear Pro', 'supply@activewear.com')
        `);
        console.log('   ✅ 3 suppliers added');

        // Insert Products
        console.log('   📱 Adding products...');
        await connection.query(`
            INSERT INTO Products (name, category, price, supplier_id) VALUES
            ('Quantum Gaming Laptop', 'Electronics', 107817.00, 1),
            ('Solar Power Bank', 'Electronics', 4149.17, 1),
            ('Memory Foam Mattress', 'Furniture', 49758.50, 2),
            ('Adjustable Dumbbells', 'Fitness', 12367.00, 3),
            ('Yoga Mat Extra Thick', 'Fitness', 2489.17, 3),
            ('Lenovo Monitor', 'Electronics', 24899.17, 1)
        `);
        console.log('   ✅ 6 products added');

        // Insert Inventory
        console.log('   📦 Adding inventory...');
        await connection.query(`
            INSERT INTO Inventory (product_id, stock_quantity, warehouse_location) VALUES
            (1, 10, 'Tech District'),
            (2, 500, 'Tech District'),
            (3, 20, 'Furniture Warehouse'),
            (4, 5, 'Fitness Center'),
            (5, 100, 'Fitness Center'),
            (6, 10, 'Main Warehouse')
        `);
        console.log('   ✅ 6 inventory records added');

        // Insert Orders
        console.log('   🛒 Adding orders...');
        await connection.query(`
            INSERT INTO Orders (customer_name, status) VALUES
            ('Charlie Brown', 'Completed'),
            ('Diana Prince', 'Pending'),
            ('Bruce Wayne', 'Processing'),
            ('Peter Parker', 'Shipped'),
            ('Tony Stark', 'Completed')
        `);
        console.log('   ✅ 5 orders added');

        // Insert OrderItems
        console.log('   📋 Adding order items...');
        await connection.query(`
            INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES
            (1, 1, 1, 107817.00),  -- Charlie: 1 Laptop
            (1, 2, 2, 4149.17),    -- Charlie: 2 Power banks
            (2, 4, 1, 12367.00),   -- Diana: 1 Dumbbell
            (3, 3, 1, 49758.50),   -- Bruce: 1 Mattress
            (4, 5, 3, 2489.17),    -- Peter: 3 Yoga mats
            (5, 6, 2, 24899.17),   -- Tony: 2 Monitors
            (5, 1, 1, 107817.00)   -- Tony: 1 Laptop
        `);
        console.log('   ✅ 7 order items added\n');

        // Step 6: Verification
        console.log('🔍 Verifying setup...');
        
        const [supplierCount] = await connection.query('SELECT COUNT(*) as count FROM Suppliers');
        const [productCount] = await connection.query('SELECT COUNT(*) as count FROM Products');
        const [inventoryCount] = await connection.query('SELECT COUNT(*) as count FROM Inventory');
        const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM Orders');
        const [orderItemCount] = await connection.query('SELECT COUNT(*) as count FROM OrderItems');

        console.log('\n📊 SETUP SUMMARY:');
        console.log(`   🏢 Suppliers: ${supplierCount[0].count}`);
        console.log(`   📱 Products: ${productCount[0].count}`);
        console.log(`   📦 Inventory: ${inventoryCount[0].count}`);
        console.log(`   🛒 Orders: ${orderCount[0].count}`);
        console.log(`   📋 Order Items: ${orderItemCount[0].count}`);

        console.log('\n🎉 Database setup completed successfully!');
        console.log('🚀 You can now start the application with: npm start');
        console.log('🌐 Then visit: http://localhost:3000');

    } catch (error) {
        console.error('\n❌ SETUP FAILED:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 TROUBLESHOOTING:');
            console.error('1. Make sure MySQL server is running');
            console.error('2. Check MySQL credentials in .env file');
            console.error('3. Verify MySQL user has necessary permissions');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n📡 Database connection closed');
        }
    }
}

// Run the setup
setupDatabase();
