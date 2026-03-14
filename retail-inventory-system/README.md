# Retail Inventory Management System
## Setup Instructions

### 🚀 Quick Start (3 Simple Steps)

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Setup Database
```bash
npm run setup
```

#### Step 3: Start Application
```bash
npm start
```

Then visit: **http://localhost:3000**

---

### 📋 Prerequisites

1. **Node.js** (version 14 or higher)
2. **MySQL Server** (version 5.7 or higher)
3. **Git** (to clone the repository)

---

### 🛠️ Detailed Setup Guide

#### 1. Environment Configuration

The application uses a `.env` file for configuration. A sample file is included:

```env
# Application Port
PORT=3000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=retail_inventory
```

**Important:** Update the MySQL credentials in `.env` file to match your MySQL setup.

#### 2. MySQL Setup

Make sure MySQL server is running and the user specified in `.env` has:
- CREATE DATABASE permissions
- Full access to the created database

#### 3. Automatic Database Setup

The `npm run setup` command will automatically:
- ✅ Create the database
- ✅ Create all necessary tables
- ✅ Insert sample data for testing
- ✅ Verify the setup

#### 4. Sample Data Included

The setup creates a complete demo environment with:

**Suppliers (3):**
- TechGiant (Electronics)
- CozyHome Furniture (Furniture)
- ActiveWear Pro (Fitness)

**Products (6):**
- Quantum Gaming Laptop - $1,299
- Solar Power Bank - $49.99
- Memory Foam Mattress - $599.50
- Adjustable Dumbbells - $149.00
- Yoga Mat Extra Thick - $29.99
- Lenovo Monitor - $299.99

**Orders (5):**
- Various customer orders with different statuses
- Complete order items with product details

**Inventory:**
- Stock levels for all products
- Warehouse locations

---

### 🌐 Application Features

#### Dashboard
- Overview with key metrics
- Total products, orders, and low stock alerts

#### Products Management
- View all products with supplier information
- Add new products
- Edit existing products
- Delete products (with inventory cleanup)

#### Order Management
- View all orders with status tracking
- Create new orders with stock validation
- Update order status
- Delete orders
- Customer order history

#### Inventory Management
- Monitor stock levels
- Update inventory quantities
- Low stock alerts

#### Supplier Management
- View supplier information
- Add new suppliers
- Update supplier details
- Delete suppliers

#### Reports
- Sales performance analytics
- Product performance metrics
- Inventory status reports

---

### 🔧 Available Commands

```bash
# Install dependencies
npm install

# Setup database (creates schema and sample data)
npm run setup

# Start the application
npm start

# Development mode (with auto-restart)
npm run dev
```

---

### 📱 Access Information

- **Frontend URL:** http://localhost:3000
- **API Base URL:** http://localhost:3000
- **Default Port:** 3000

---

### 🔍 Troubleshooting

#### Database Connection Issues
1. Verify MySQL server is running
2. Check credentials in `.env` file
3. Ensure MySQL user has CREATE DATABASE permissions

#### Port Already in Use
1. Change PORT in `.env` file
2. Or stop the service using port 3000

#### Node.js Version Issues
1. Ensure Node.js 14+ is installed
2. Run `node --version` to check

---

### 💡 Tips for Your Boss

1. **First Time Setup:** Just run `npm install` → `npm run setup` → `npm start`
2. **Data Persistence:** All data is stored in MySQL database
3. **Backup:** Regularly backup the MySQL database
4. **Customization:** Modify `.env` file for different configurations
5. **Support:** The application includes comprehensive error handling and user-friendly notifications

---

### 🏢 Business Value

This system provides:
- **Real-time inventory tracking**
- **Order management with stock validation**
- **Supplier relationship management**
- **Sales analytics and reporting**
- **Automated low-stock alerts**
- **Customer order history**

Perfect for small to medium retail businesses looking to streamline operations and improve inventory management.

---

**🎉 Ready to use! The setup process takes less than 2 minutes.**
