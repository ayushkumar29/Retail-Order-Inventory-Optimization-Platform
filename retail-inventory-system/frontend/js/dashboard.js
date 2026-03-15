async function initDashboard() {
    try {
        await loadDashboardData();
    } catch (error) {
        showNotification('Failed to load dashboard data. Ensure backend is running.', 'danger');
    }
}

// Navigate to specific page
function navigateToPage(page) {
    // Update URL hash
    window.location.hash = page;
}

// Format number in Indian style (e.g., 1,23,456.78)
function formatINR(amount) {
    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    return formatted;
}

async function loadDashboardData() {
    try {
        // Fetch all data concurrently
        const [products, orders, inventory, lowStock, salesReport, productPerformance, inventoryReport, suppliers] = await Promise.all([
            getProducts(),
            getOrders(),
            getInventory(),
            getLowStock(),
            getSalesReport(),
            getProductPerformanceReport(),
            getInventoryReport(),
            getSuppliers()
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
        document.getElementById('total-revenue').innerText = `₹${formatINR(totalRevenue)}`;

        // Load detailed sections
        await loadSalesSummary(salesReport);
        await loadProductPerformance(productPerformance);
        await loadInventoryStatus(inventoryReport);
        await loadSuppliersOverview(suppliers, products);

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
            <td><strong>₹${formatINR(sale.total_revenue)}</strong></td>
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
            <td><strong>₹${formatINR(product.total_revenue)}</strong></td>
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

async function loadSuppliersOverview(suppliers, products) {
    const tbody = document.getElementById('suppliers-overview-body');
    if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No suppliers found</td></tr>';
        return;
    }

    // Count products per supplier
    const supplierProductCount = {};
    suppliers.forEach(s => supplierProductCount[s.supplier_id] = 0);
    products.forEach(p => {
        if (p.supplier_id && supplierProductCount[p.supplier_id] !== undefined) {
            supplierProductCount[p.supplier_id]++;
        }
    });

    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td><strong>${supplier.supplier_name}</strong></td>
            <td><a href="mailto:${supplier.contact_email}" class="text-muted">${supplier.contact_email}</a></td>
            <td><span class="badge bg-info">${supplierProductCount[supplier.supplier_id] || 0}</span></td>
        </tr>
    `).join('');
}

// Make refresh function globally accessible
window.refreshDashboard = loadDashboardData;
