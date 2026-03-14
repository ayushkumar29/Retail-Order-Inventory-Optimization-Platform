-- Drop tables in reverse order of dependencies to avoid foreign key errors
DROP TABLE IF EXISTS OrderItems; -- [STMT]
DROP TABLE IF EXISTS Orders; -- [STMT]
DROP TABLE IF EXISTS Inventory; -- [STMT]
DROP TABLE IF EXISTS Products; -- [STMT]
DROP TABLE IF EXISTS Suppliers; -- [STMT]

-- Suppliers Table
CREATE TABLE Suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255)
); -- [STMT]

-- Products Table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    supplier_id INT,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE SET NULL
); -- [STMT]

-- Inventory Table
CREATE TABLE Inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    stock_quantity INT DEFAULT 0,
    warehouse_location VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
); -- [STMT]

-- Orders Table
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
); -- [STMT]

-- OrderItems Table
CREATE TABLE OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
); -- [STMT]

-- Performance Indexes
CREATE INDEX idx_products_category ON Products(category); -- [STMT]
CREATE INDEX idx_orders_status ON Orders(status); -- [STMT]
CREATE INDEX idx_orders_date ON Orders(order_date); -- [STMT]
CREATE INDEX idx_inventory_stock ON Inventory(stock_quantity); -- [STMT]

-- Reporting Views
-- 1. View for full inventory status including product and supplier details
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
LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id; -- [STMT]

-- 2. View for flattened sales details
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
JOIN Products p ON oi.product_id = p.product_id; -- [STMT]

-- Stored Procedures for Aggregated Reports
-- 1. Get Daily Sales Summary
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
END; -- [STMT]

-- 2. Get Product Performance Report
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
END; -- [STMT]
