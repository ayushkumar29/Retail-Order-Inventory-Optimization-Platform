require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        // Connect without a specific database to create it if necessary
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        const dbName = process.env.DB_NAME || 'retail_inventory';
        
        console.log(`Creating database '${dbName}' if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        console.log('Executing schema to create tables, views, and procedures...');
        // Split by the custom marker
        const statements = schema.split('-- [STMT]').map(s => s.trim()).filter(s => s.length > 0);
        
        for (let stmt of statements) {
            await connection.query(stmt);
        }
        
        console.log('Clearing existing data...');
        // Disable foreign key checks temporarily to clear data
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE OrderItems');
        await connection.query('TRUNCATE TABLE Orders');
        await connection.query('TRUNCATE TABLE Inventory');
        await connection.query('TRUNCATE TABLE Products');
        await connection.query('TRUNCATE TABLE Suppliers');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting seed data...');
        
        // Insert Suppliers
        // Insert Suppliers
        await connection.query(`
            INSERT INTO Suppliers (supplier_name, contact_email) VALUES
            ('TechGiant', 'sales@techgiant.com'),
            ('CozyHome Furniture', 'orders@cozyhome.com'),
            ('ActiveWear Pro', 'supply@activewear.com')
        `);
        
        // Insert Products
        await connection.query(`
            INSERT INTO Products (name, category, price, supplier_id) VALUES
            ('Quantum Gaming Laptop', 'Electronics', 1299.00, 1),
            ('Solar Power Bank', 'Electronics', 49.99, 1),
            ('Memory Foam Mattress', 'Furniture', 599.50, 2),
            ('Adjustable Dumbbells', 'Fitness', 149.00, 3),
            ('Yoga Mat Extra Thick', 'Fitness', 29.99, 3)
        `);
        
        // Insert Inventory
        await connection.query(`
            INSERT INTO Inventory (product_id, stock_quantity, warehouse_location) VALUES
            (1, 10, 'Tech District'),
            (2, 500, 'Tech District'),
            (3, 20, 'Furniture Warehouse'),
            (4, 5, 'Fitness Center'),
            (5, 100, 'Fitness Center')
        `);

        // Insert Orders
        await connection.query(`
            INSERT INTO Orders (customer_name, status) VALUES
            ('Charlie Brown', 'Completed'),
            ('Diana Prince', 'Pending')
        `);

        // Insert OrderItems
        await connection.query(`
            INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES
            (1, 1, 1, 1299.00),  -- 1 Laptop for Charlie
            (1, 2, 2, 49.99),    -- 2 Power banks for Charlie
            (2, 4, 1, 149.00)    -- 1 Dumbbell for Diana
        `);

        console.log('✅ Seed data inserted successfully!');
        
    } catch (err) {
        console.error('❌ Error seeding database:', err.message);
        console.log('\nPlease make sure your MySQL server is running and the credentials in .env are correct.');
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

seed();
