async function initProducts() {
    loadProducts();
    populateSupplierDropdown();

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value;
            const price = document.getElementById('productPrice').value;
            const initial_stock = document.getElementById('productStock').value;
            const supplier_id = document.getElementById('productSupplier').value;

            try {
                await createProduct({ 
                    name, 
                    category, 
                    price: parseFloat(price),
                    initial_stock: parseInt(initial_stock, 10),
                    supplier_id: parseInt(supplier_id, 10)
                });
                showNotification('Product added successfully!', 'success');
                // Hide the form collapse
                const collapseElement = document.getElementById('addProductForm');
                const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement);
                if (bsCollapse) bsCollapse.hide();
                
                productForm.reset();
                loadProducts();
            } catch (error) {
                showNotification(error.message || 'Failed to add product', 'danger');
            }
        });
    }
}

async function populateSupplierDropdown() {
    try {
        const suppliers = await getSuppliers();
        const select = document.getElementById('productSupplier');
        select.innerHTML = '<option value="" disabled selected>Select Supplier...</option>';
        
        suppliers.forEach(s => {
            const option = document.createElement('option');
            option.value = s.supplier_id;
            option.textContent = s.supplier_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading suppliers for dropdown:', error);
    }
}

async function loadProducts() {
    try {
        const products = await getProducts();
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No products found. Add one above!</td></tr>`;
            return;
        }

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${product.product_id}</td>
                <td class="fw-bold">${product.name}</td>
                <td><span class="badge bg-secondary">${product.category}</span></td>
                <td><span class="text-muted small">${product.supplier_name || 'N/A'}</span></td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0">
                            <li><a class="dropdown-item small" href="javascript:void(0)" onclick="openEditProductModal(${product.product_id})"><i class="fa-solid fa-pen me-2 text-primary"></i>Modify</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item small text-danger" href="javascript:void(0)" onclick="confirmDeleteProduct(${product.product_id})"><i class="fa-solid fa-trash me-2"></i>Delete</a></li>
                        </ul>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showNotification('Failed to load products', 'danger');
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Error loading products.</td></tr>`;
    }
}

async function confirmDeleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This will also remove its inventory records.')) {
        try {
            await deleteProduct(id);
            showNotification('Product deleted successfully', 'success');
            loadProducts();
        } catch (error) {
            showNotification(error.message || 'Failed to delete product', 'danger');
        }
    }
}

async function openEditProductModal(id) {
    try {
        const products = await getProducts();
        const product = products.find(p => p.product_id === id);
        if (!product) return;

        document.getElementById('editProductId').value = product.product_id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        
        // Populate supplier dropdown for modal
        const suppliers = await getSuppliers();
        const select = document.getElementById('editProductSupplier');
        select.innerHTML = '<option value="" disabled>Select Supplier...</option>';
        suppliers.forEach(s => {
            const option = document.createElement('option');
            option.value = s.supplier_id;
            option.textContent = s.supplier_name;
            if (s.supplier_id === product.supplier_id) option.selected = true;
            select.appendChild(option);
        });

        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();

        // One-time listener for the edit form
        const editForm = document.getElementById('edit-product-form');
        editForm.onsubmit = async (e) => {
            e.preventDefault();
            const updatedData = {
                name: document.getElementById('editProductName').value,
                category: document.getElementById('editProductCategory').value,
                price: parseFloat(document.getElementById('editProductPrice').value),
                supplier_id: parseInt(document.getElementById('editProductSupplier').value, 10)
            };

            try {
                await updateProduct(id, updatedData);
                showNotification('Product updated successfully', 'success');
                modal.hide();
                loadProducts();
            } catch (error) {
                showNotification(error.message || 'Failed to update product', 'danger');
            }
        };

    } catch (error) {
        showNotification('Failed to load product details', 'danger');
    }
}

// Global exposure
window.confirmDeleteProduct = confirmDeleteProduct;
window.openEditProductModal = openEditProductModal;
