async function initDashboard() {
    try {
        await loadDashboardData();
    } catch (error) {
        showNotification('Failed to load dashboard data. Ensure backend is running.', 'danger');
    }
}

async function loadDashboardData() {
    try {
        // Fetch all data concurrently
        const [products, orders, inventory, lowStock, salesReport, productPerformance, inventoryReport] = await Promise.all([
            getProducts(),
            getOrders(),
            getInventory(),
            getLowStock(),
            getSalesReport(),
            getProductPerformanceReport(),
            getInventoryReport()
        ]);

        // Update Basic Metrics
        document.getElementById('total-products-count').innerText = products.length;
        document.getElementById('total-orders-count').innerText = orders.length;
        
        // Calculate and display low stock count
        const lowStockCount = lowStock.length;
        document.getElementById('low-stock-count').innerText = lowStockCount;

        // Calculate and display total revenue
        let totalRevenue = 0;
        orders.forEach(order => {
            if (order.total_price) {
                totalRevenue += parseFloat(order.total_price);
            }
        });
        document.getElementById('total-revenue').innerText = `$${totalRevenue.toFixed(2)}`;

        // Load detailed sections
        await loadSalesSummary(salesReport);
        await loadProductPerformance(productPerformance);
        await loadInventoryStatus(inventoryReport);

    } catch (error) {
        console.error('Dashboard loading error:', error);
        showNotification('Failed to load some dashboard data', 'warning');
    }
}

async function loadSalesSummary(salesData) {
    const tbody = document.getElementById('sales-summary-body');
    if (!salesData || salesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No sales data available</td></tr>';
        return;
    }

    tbody.innerHTML = salesData.map(sale => `
        <tr>
            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
            <td><span class="badge bg-info">${sale.total_orders}</span></td>
            <td><strong>$${parseFloat(sale.total_revenue).toFixed(2)}</strong></td>
            <td>${sale.total_items_sold}</td>
        </tr>
    `).join('');
}

async function loadProductPerformance(performanceData) {
    const tbody = document.getElementById('product-performance-body');
    if (!performanceData || performanceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No performance data available</td></tr>';
        return;
    }

    tbody.innerHTML = performanceData.slice(0, 5).map(product => `
        <tr>
            <td><strong>${product.product_name}</strong></td>
            <td><span class="badge bg-primary">${product.total_quantity_sold}</span></td>
            <td><strong>$${parseFloat(product.total_revenue).toFixed(2)}</strong></td>
        </tr>
    `).join('');
}

async function loadInventoryStatus(inventoryData) {
    const tbody = document.getElementById('inventory-status-body');
    if (!inventoryData || inventoryData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No inventory data available</td></tr>';
        return;
    }

    tbody.innerHTML = inventoryData.map(item => {
        let statusBadge = '';
        if (item.stock_status === 'Out of Stock') {
            statusBadge = '<span class="badge bg-danger">Out of Stock</span>';
        } else if (item.stock_status === 'Low Stock') {
            statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
        } else {
            statusBadge = '<span class="badge bg-success">In Stock</span>';
        }

        return `
            <tr>
                <td><strong>${item.product_name}</strong></td>
                <td><span class="badge bg-secondary">${item.category}</span></td>
                <td>${item.stock_quantity}</td>
                <td><small class="text-muted">${item.warehouse_location}</small></td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
}
