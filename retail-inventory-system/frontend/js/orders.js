async function initOrders() {
    loadOrders();
    populateProductDropdown();

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const customer_name = document.getElementById('customerName').value;
            const product_id = parseInt(document.getElementById('orderProduct').value, 10);
            const quantity = parseInt(document.getElementById('orderQuantity').value, 10);

            try {
                await createOrder({ 
                    customer_name, 
                    items: [
                        { product_id, quantity }
                    ] 
                });
                showNotification('Order created successfully!', 'success');
                
                // Refresh dashboard if visible
                if (window.refreshDashboard) {
                    window.refreshDashboard();
                }
                
                const collapseElement = document.getElementById('addOrderForm');
                const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement);
                if (bsCollapse) bsCollapse.hide();
                
                orderForm.reset();
                loadOrders();
            } catch (error) {
                showNotification(error.message || 'Failed to create order', 'danger');
            }
        });
    }
}

async function populateProductDropdown() {
    try {
        const products = await getProducts();
        const select = document.getElementById('orderProduct');
        select.innerHTML = '<option value="" disabled selected>Select a product...</option>';
        
        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.product_id;
            const price = parseFloat(p.price).toFixed(2);
            option.textContent = `${p.name} (₹${price})`;
            select.appendChild(option);
        });
    } catch (error) {
        const select = document.getElementById('orderProduct');
        select.innerHTML = '<option value="" disabled selected>Error loading products</option>';
    }
}

async function loadOrders() {
    try {
        console.log('🔍 Loading orders...');
        
        // Fetch orders and products
        const [orders, products] = await Promise.all([
            getOrders(),
            getProducts()
        ]);
        
        console.log('Orders received:', orders);
        console.log('Orders count:', orders.length);
        console.log('Products received:', products.length);
        
        // Create lookup dictionaries
        const productMap = {};
        products.forEach(p => productMap[p.product_id] = p);

        const tbody = document.getElementById('orders-table-body');
        console.log('Table body element:', tbody);
        
        tbody.innerHTML = '';
        
        if (orders.length === 0) {
            console.log('No orders to display');
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No orders found.</td></tr>';
            return;
        }

        orders.forEach((order, index) => {
            console.log(`Processing order ${index}:`, order);
            
            const tr = document.createElement('tr');
            
            const status = order.status || 'Pending';
            const orderId = order.order_id || order.id || 'N/A';
            
            let badgeClass = 'bg-secondary';
            if (status === 'Completed') badgeClass = 'bg-success';
            else if (status === 'Pending') badgeClass = 'bg-warning text-dark';
            else if (status === 'Processing') badgeClass = 'bg-info text-dark';
            else if (status === 'Shipped') badgeClass = 'bg-primary';
            else if (status === 'Cancelled') badgeClass = 'bg-danger';

            const statusBadge = `<span class="badge ${badgeClass}">${status}</span>`;

            const actionsHtml = `
                <div class="dropdown">
                    <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow-sm border-0">
                        <li class="dropdown-header small text-uppercase fw-bold">Update Status</li>
                        <li><a class="dropdown-item small" href="javascript:void(0)" onclick="changeOrderStatus(${orderId}, 'Processing')">Mark Processing</a></li>
                        <li><a class="dropdown-item small" href="javascript:void(0)" onclick="changeOrderStatus(${orderId}, 'Shipped')">Mark Shipped</a></li>
                        <li><a class="dropdown-item small text-success fw-bold" href="javascript:void(0)" onclick="changeOrderStatus(${orderId}, 'Completed')">Mark Completed</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item small text-danger" href="javascript:void(0)" onclick="confirmDeleteOrder(${orderId})"><i class="fa-solid fa-trash me-2"></i>Delete Record</a></li>
                    </ul>
                </div>
            `;

            const productInfo = productMap[order.product_id];
            const productNameDisplay = productInfo ? productInfo.name : `Product #${order.product_id}`;
            const supplierNameDisplay = productInfo && productInfo.supplier_name ? productInfo.supplier_name : '-';
            const dateStr = order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A';
            
            let priceDisp = '0.00';
            if (order.total_price !== undefined) {
                priceDisp = parseFloat(order.total_price).toFixed(2);
            } else if (productInfo && productInfo.price) {
                priceDisp = (parseFloat(productInfo.price) * parseInt(order.quantity, 10)).toFixed(2);
            }

            tr.innerHTML = `
                <td>#${orderId}</td>
                <td class="fw-bold">${order.customer_name}</td>
                <td><span class="text-primary">${productNameDisplay}</span></td>
                <td><span class="text-muted small">${supplierNameDisplay}</span></td>
                <td>${order.quantity}</td>
                <td>₹${priceDisp}</td>
                <td>${statusBadge}</td>
                <td class="text-muted small">${dateStr}</td>
                <td>${actionsHtml}</td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log('✅ Orders loaded successfully');
    } catch (error) {
        console.error('❌ Error in loadOrders:', error);
        showNotification('Failed to load orders: ' + error.message, 'danger');
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Error loading orders: ${error.message}</td></tr>`;
    }
}

async function changeOrderStatus(orderId, newStatus) {
    if (!orderId) return;
    
    try {
        await updateOrderStatus(orderId, newStatus);
        showNotification(`Order #${orderId} marked as ${newStatus}`, 'success');
        loadOrders(); // Refresh table
        
        // Refresh dashboard if visible
        if (window.refreshDashboard) {
            window.refreshDashboard();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update order status', 'danger');
    }
}

async function confirmDeleteOrder(id) {
    if (!id) {
        showNotification('Invalid order ID', 'danger');
        return;
    }
    
    if (confirm('Are you sure you want to permanently delete this order record? This action cannot be undone.')) {
        try {
            const result = await deleteOrder(id);
            showNotification('Order record deleted', 'success');
            loadOrders();
            
            // Refresh dashboard if visible
            if (window.refreshDashboard) {
                window.refreshDashboard();
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to delete order';
            
            if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                showNotification('Order not found. It may have been already deleted.', 'warning');
            } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
                showNotification('Server error occurred. Please try again later.', 'danger');
            } else {
                showNotification(errorMessage, 'danger');
            }
        }
    }
}

// Make globally accessible for onclick
window.changeOrderStatus = changeOrderStatus;
window.confirmDeleteOrder = confirmDeleteOrder;
