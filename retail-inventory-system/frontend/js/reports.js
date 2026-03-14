function initReports() {
    loadReports();
}

async function loadReports() {
    try {
        // Fetch all report data concurrently
        const [inventoryReport, salesReport, performanceReport] = await Promise.all([
            fetchAPI('/reports/inventory'),
            fetchAPI('/reports/sales'),
            fetchAPI('/reports/performance')
        ]);

        renderInventoryReport(inventoryReport);
        renderSalesReport(salesReport);
        renderPerformanceReport(performanceReport);

    } catch (error) {
        console.error('Failed to load reports:', error);
        showNotification('Failed to load analytical reports', 'danger');
    }
}

function renderInventoryReport(data) {
    const tbody = document.getElementById('inventory-report-body');
    tbody.innerHTML = '';

    data.slice(0, 10).forEach(item => { // Show top 10 for summary
        const statusClass = item.stock_status === 'In Stock' ? 'text-success' : (item.stock_status === 'Low Stock' ? 'text-warning' : 'text-danger');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="small fw-bold">${item.product_name}</td>
            <td class="small">${item.stock_quantity}</td>
            <td class="small"><span class="badge ${getStatusBadge(item.stock_status)}">${item.stock_status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderSalesReport(data) {
    const tbody = document.getElementById('sales-report-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">No sales recorded yet.</td></tr>';
        return;
    }

    data.forEach(day => {
        const tr = document.createElement('tr');
        const dateStr = new Date(day.sale_date).toLocaleDateString();
        tr.innerHTML = `
            <td class="fw-bold">${dateStr}</td>
            <td>${day.total_orders}</td>
            <td class="text-success fw-bold">$${parseFloat(day.total_revenue).toFixed(2)}</td>
            <td>${day.total_items_sold}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPerformanceReport(data) {
    const tbody = document.getElementById('performance-report-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${item.product_name} <br><small class="text-muted fw-normal">${item.category}</small></td>
            <td>${item.total_quantity_sold}</td>
            <td class="text-primary fw-bold">$${parseFloat(item.total_revenue).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusBadge(status) {
    switch(status) {
        case 'In Stock': return 'bg-success-subtle text-success border border-success';
        case 'Low Stock': return 'bg-warning-subtle text-warning border border-warning';
        case 'Out of Stock': return 'bg-danger-subtle text-danger border border-danger';
        default: return 'bg-secondary';
    }
}
