const API_BASE_URL = (window.location.port === '3000') ? '' : 'http://localhost:3000';

async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            const errorMessage = (data && (data.error || data.message)) || `Server Error: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return data && data.data !== undefined ? data.data : data;
    } catch (error) {
        throw error;
    }
}

async function getProducts() {
    return fetchAPI('/products');
}

async function createProduct(productData) {
    return fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    });
}

async function getInventory() {
    return fetchAPI('/inventory');
}

async function updateInventory(inventoryData) {
    return fetchAPI('/inventory/update', {
        method: 'PUT',
        body: JSON.stringify(inventoryData)
    });
}

async function getOrders() {
    return fetchAPI('/orders');
}

async function createOrder(orderData) {
    return fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

async function updateOrderStatus(orderId, status) {
    return fetchAPI(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}

async function getSuppliers() {
    return fetchAPI('/suppliers');
}

async function createSupplier(supplierData) {
    return fetchAPI('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData)
    });
}

async function updateSupplier(id, supplierData) {
    return fetchAPI(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(supplierData)
    });
}

async function deleteSupplier(id) {
    return fetchAPI(`/suppliers/${id}`, {
        method: 'DELETE'
    });
}

async function updateProduct(id, productData) {
    return fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    });
}

async function deleteProduct(id) {
    return fetchAPI(`/products/${id}`, {
        method: 'DELETE'
    });
}

async function updateOrder(id, orderData) {
    return fetchAPI(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData)
    });
}

async function deleteOrder(id) {
    return fetchAPI(`/orders/${id}`, {
        method: 'DELETE'
    });
}

function showNotification(message, type = 'success') {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    notificationArea.appendChild(alert);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150); // wait for fade out animation
    }, 4000);
}
