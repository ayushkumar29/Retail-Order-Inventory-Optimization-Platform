async function initDashboard() {
    try {
        await loadDashboardData();
    } catch (error) {
        showNotification('Failed to load dashboard data. Ensure backend is running.', 'danger');
    }
}

async function loadDashboardData() {
    // Fetch all data concurrently
    const [products, orders, inventory] = await Promise.all([
        getProducts(),
        getOrders(),
        getInventory()
    ]);

    // Update Products Count
    document.getElementById('total-products-count').innerText = products.length;

    // Update Orders Count
    document.getElementById('total-orders-count').innerText = orders.length;

    // Calculate Low Stock (less than 10)
    const lowStockThreshold = 10;
    const lowStockCount = inventory.filter(item => item.stock_quantity < lowStockThreshold).length;
    document.getElementById('low-stock-count').innerText = lowStockCount;
}
