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
            option.textContent = `${p.name} ($${price})`;
            select.appendChild(option);
        });
    } catch (error) {
        const select = document.getElementById('orderProduct');
        select.innerHTML = '<option value="" disabled selected>Error loading products</option>';
    }
}

async function loadOrders() {
    try {
        // Fetch orders and products
        const [orders, products] = await Promise.all([
            getOrders(),
            getProducts()
        ]);
        
        // Create lookup dictionaries
        const productMap = {};
        products.forEach(p => productMap[p.product_id] = p);

        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';

        orders.forEach(order => {
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

            // Actions with 3-dot dropdown
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

            // Use lookup dictionaries
            const productInfo = productMap[order.product_id];
            const productNameDisplay = productInfo ? productInfo.name : `Product #${order.product_id}`;
            const dateStr = order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A';
            
            // Re-calculate the price since the backend doesn't supply total_price on GET /orders
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
                <td>${order.quantity}</td>
                <td>$${priceDisp}</td>
                <td>${statusBadge}</td>
                <td class="text-muted small">${dateStr}</td>
                <td>${actionsHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showNotification('Failed to load orders', 'danger');
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error loading orders.</td></tr>`;
    }
}

async function changeOrderStatus(orderId, newStatus) {
    if (!orderId) return;
    
    try {
        await updateOrderStatus(orderId, newStatus);
        showNotification(`Order #${orderId} marked as ${newStatus}`, 'success');
        loadOrders(); // Refresh table
    } catch (error) {
        showNotification(error.message || 'Failed to update order status', 'danger');
    }
}

async function confirmDeleteOrder(id) {
    if (!id) {
        showNotification('Invalid order ID', 'danger');
        return;
    }
    
    console.log(`[Orders] Attempting to delete order ID: ${id}`);
    
    if (confirm('Are you sure you want to permanently delete this order record? This action cannot be undone.')) {
        try {
            console.log(`[Orders] Calling deleteOrder API for ID: ${id}`);
            const result = await deleteOrder(id);
            console.log(`[Orders] Delete successful:`, result);
            showNotification('Order record deleted', 'success');
            loadOrders();
        } catch (error) {
            console.error(`[Orders] Delete failed for ID ${id}:`, error);
            const errorMessage = error.message || 'Failed to delete order';
            
            // Provide more specific error messages
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
