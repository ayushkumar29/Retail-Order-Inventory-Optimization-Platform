function DashboardView() {
    return `
        <h2 class="page-header">Dashboard Overview</h2>
        <div class="row g-4 mt-2">
            <div class="col-md-4">
                <div class="card p-4 h-100 border-0" style="border-left: 5px solid var(--primary-color) !important;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title text-muted mb-2">Total Products</h5>
                            <h2 class="card-text display-4 mb-0" id="total-products-count">-</h2>
                        </div>
                        <div class="bg-light p-3 rounded-circle" style="color: var(--primary-color);">
                            <i class="fa-solid fa-box fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4 h-100 border-0" style="border-left: 5px solid var(--success-color) !important;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title text-muted mb-2">Total Orders</h5>
                            <h2 class="card-text display-4 mb-0" id="total-orders-count">-</h2>
                        </div>
                        <div class="bg-light p-3 rounded-circle" style="color: var(--success-color);">
                            <i class="fa-solid fa-cart-shopping fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4 h-100 border-0" style="border-left: 5px solid var(--danger-color) !important;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title text-muted mb-2">Low Stock Items</h5>
                            <h2 class="card-text display-4 text-danger mb-0" id="low-stock-count">-</h2>
                        </div>
                        <div class="bg-light p-3 rounded-circle" style="color: var(--danger-color);">
                            <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function ProductsView() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
            <h2 class="page-header m-0">Manage Products</h2>
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#addProductForm">
                <i class="fa-solid fa-plus me-2"></i>Add New Product
            </button>
        </div>

        <div class="collapse mb-5" id="addProductForm">
            <div class="card card-body shadow-sm border-0">
                <h5 class="mb-4">Create Product</h5>
                <form id="product-form">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="productName" class="form-label">Product Name</label>
                            <input type="text" class="form-control" id="productName" required placeholder="Enter product name">
                        </div>
                        <div class="col-md-3">
                            <label for="productCategory" class="form-label">Category</label>
                            <input type="text" class="form-control" id="productCategory" required placeholder="e.g. Electronics">
                        </div>
                        <div class="col-md-3">
                            <label for="productPrice" class="form-label">Price ($)</label>
                            <input type="number" class="form-control" id="productPrice" required min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="col-md-3">
                            <label for="productStock" class="form-label small text-muted">Initial Stock</label>
                            <input type="number" class="form-control bg-light border-0" id="productStock" placeholder="0" min="0" required>
                        </div>
                        <div class="col-md-4">
                            <label for="productSupplier" class="form-label small text-muted">Supplier</label>
                            <select class="form-select bg-light border-0" id="productSupplier" required>
                                <option value="" disabled selected>Select Supplier...</option>
                            </select>
                        </div>
                        <div class="col-12 mt-4 text-end">
                            <button type="button" class="btn btn-outline-secondary me-2" data-bs-toggle="collapse" data-bs-target="#addProductForm">Cancel</button>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-check me-2"></i>Save Product</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th width="10%">ID</th>
                        <th width="40%">Name</th>
                        <th width="30%">Category</th>
                        <th width="15%">Supplier</th>
                        <th width="15%">Price</th>
                        <th width="10%">Actions</th>
                    </tr>
                </thead>
                <tbody id="products-table-body">
                    <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            Loading products...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        ${ProductEditModalView()}
    `;
}

function InventoryView() {
    return `
        <h2 class="page-header mt-2 mb-4">Inventory Management</h2>
        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th width="10%">ID</th>
                        <th width="40%">Product</th>
                        <th width="20%">Stock Level</th>
                        <th width="20%">Warehouse Location</th>
                        <th width="10%">Actions</th>
                    </tr>
                </thead>
                <tbody id="inventory-table-body">
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            Loading inventory...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal fade" id="updateStockModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Stock</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted mb-4">Update inventory for <strong id="modalProductName" class="text-dark"></strong>. Current stock: <span id="modalCurrentStock" class="fw-bold"></span></p>
                        <form id="update-stock-form">
                            <div class="mb-3">
                                <label for="stockChange" class="form-label">Quantity Change</label>
                                <input type="number" class="form-control" id="stockChange" required placeholder="e.g. 50 (to add) or -10 (to remove)">
                                <div class="form-text">Use positive numbers to add stock, negative to remove.</div>
                            </div>
                            <div class="text-end mt-4">
                                <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-save me-2"></i>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function SuppliersView() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
            <h2 class="page-header m-0">Manage Suppliers</h2>
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#addSupplierForm">
                <i class="fa-solid fa-plus me-2"></i>Add New Supplier
            </button>
        </div>

        <div class="collapse mb-5" id="addSupplierForm">
            <div class="card card-body shadow-sm border-0">
                <h5 class="mb-4">Register Supplier</h5>
                <form id="supplier-form">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="supplierName" class="form-label">Business Name</label>
                            <input type="text" class="form-control" id="supplierName" required placeholder="e.g. Global Supplies Ltd">
                        </div>
                        <div class="col-md-6">
                            <label for="supplierEmail" class="form-label">Contact Email</label>
                            <input type="email" class="form-control" id="supplierEmail" required placeholder="contact@supplier.com">
                        </div>
                        <div class="col-12 mt-4 text-end">
                            <button type="button" class="btn btn-outline-secondary me-2" data-bs-toggle="collapse" data-bs-target="#addSupplierForm">Cancel</button>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-check me-2"></i>Save Supplier</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th width="10%">ID</th>
                        <th width="40%">Supplier Name</th>
                        <th width="40%">Contact Email</th>
                        <th width="10%">Actions</th>
                    </tr>
                </thead>
                <tbody id="suppliers-table-body">
                    <tr>
                        <td colspan="4" class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            Loading suppliers...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function OrdersView() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
            <h2 class="page-header m-0">Order Management</h2>
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#addOrderForm">
                <i class="fa-solid fa-plus me-2"></i>Create New Order
            </button>
        </div>

        <div class="collapse mb-5" id="addOrderForm">
            <div class="card card-body shadow-sm border-0">
                <h5 class="mb-4">Create Order</h5>
                <form id="order-form">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="customerName" class="form-label">Customer Name</label>
                            <input type="text" class="form-control" id="customerName" required placeholder="Enter customer name">
                        </div>
                        <div class="col-md-5">
                            <label for="orderProduct" class="form-label">Select Product</label>
                            <select class="form-select" id="orderProduct" required>
                                <option value="" disabled selected>Loading products...</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="orderQuantity" class="form-label">Quantity</label>
                            <input type="number" class="form-control" id="orderQuantity" required min="1" placeholder="1">
                        </div>
                        <div class="col-12 mt-4 text-end">
                            <button type="button" class="btn btn-outline-secondary me-2" data-bs-toggle="collapse" data-bs-target="#addOrderForm">Cancel</button>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-check me-2"></i>Submit Order</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th width="15%">Actions</th>
                    </tr>
                </thead>
                <tbody id="orders-table-body">
                    <tr>
                        <td colspan="8" class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            Loading orders...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function ReportsView() {
    return `
        <h2 class="page-header mt-2 mb-4">Performance Insights</h2>
        
        <div class="row g-4">
            <!-- Sales Summary Section -->
            <div class="col-12">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white py-3">
                        <h5 class="m-0 fw-bold text-primary"><i class="fa-solid fa-sack-dollar me-2"></i>Daily Sales Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Orders</th>
                                        <th>Total Revenue</th>
                                        <th>Items Sold</th>
                                    </tr>
                                </thead>
                                <tbody id="sales-report-body">
                                    <tr><td colspan="4" class="text-center py-4">Loading sales data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Performance Section -->
            <div class="col-md-7">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-white py-3">
                        <h5 class="m-0 fw-bold text-success"><i class="fa-solid fa-ranking-star me-2"></i>Product Performance</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>Items Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody id="performance-report-body">
                                    <tr><td colspan="3" class="text-center py-4">Loading performance data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stock Status Breakdown -->
            <div class="col-md-5">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-white py-3">
                        <h5 class="m-0 fw-bold text-warning"><i class="fa-solid fa-boxes-stacked me-2"></i>Stock Status Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>Level</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-report-body">
                                    <tr><td colspan="3" class="text-center py-4">Loading inventory status...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function ProductEditModalView() {
    return `
        <div class="modal fade" id="editProductModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white py-3">
                        <h5 class="modal-title fw-bold"><i class="fa-solid fa-pen-to-square me-2"></i>Edit Product</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="edit-product-form">
                            <input type="hidden" id="editProductId">
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Product Name</label>
                                <input type="text" class="form-control bg-light" id="editProductName" required>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold text-muted">Category</label>
                                    <input type="text" class="form-control bg-light" id="editProductCategory" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold text-muted">Price ($)</label>
                                    <input type="number" class="form-control bg-light" id="editProductPrice" step="0.01" required>
                                </div>
                            </div>
                            <div class="mb-3 mt-3">
                                <label class="form-label small fw-bold text-muted">Supplier</label>
                                <select class="form-select bg-light" id="editProductSupplier" required>
                                    <option value="" disabled>Select Supplier...</option>
                                </select>
                            </div>
                            <div class="text-end mt-4 pt-2 border-top">
                                <button type="button" class="btn btn-link text-secondary text-decoration-none me-3" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary px-4">Update Database</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

