let currentProductId = null;

async function initInventory() {
    loadInventory();

    const updateForm = document.getElementById('update-stock-form');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const changeValue = parseInt(document.getElementById('stockChange').value, 10);
            
            try {
                await updateInventory({
                    productId: currentProductId,
                    stockQuantity: changeValue
                });
                showNotification('Stock updated successfully!', 'success');
                
                // Hide modal
                const modalElement = document.getElementById('updateStockModal');
                const bsModal = bootstrap.Modal.getInstance(modalElement);
                if(bsModal) bsModal.hide();

                updateForm.reset();
                loadInventory();
            } catch (error) {
                showNotification(error.message || 'Failed to update stock', 'danger');
            }
        });
    }

    // Ensure openUpdateModal is available for the onclick handler in the template
    window.openUpdateModal = function(productId, productName, currentQuantity) {
        currentProductId = productId;
        
        const productNameElem = document.getElementById('modalProductName');
        const currentStockElem = document.getElementById('modalCurrentStock');
        const stockChangeElem = document.getElementById('stockChange');

        if (productNameElem) productNameElem.innerText = productName;
        if (currentStockElem) currentStockElem.innerText = currentQuantity;
        if (stockChangeElem) stockChangeElem.value = '';

        const modalElem = document.getElementById('updateStockModal');
        if (modalElem) {
            const modal = new bootstrap.Modal(modalElem);
            modal.show();
        }
    };
}

async function loadInventory() {
    try {
        const inventory = await getInventory();
        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '';

        if (inventory.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No inventory records found.</td></tr>`;
            return;
        }

        inventory.forEach(item => {
            const tr = document.createElement('tr');
            
            const isLowStock = item.stock_quantity < 10;
            const stockClass = isLowStock ? 'text-danger fw-bold' : 'text-success fw-bold';
            const icon = isLowStock ? '<i class="fa-solid fa-triangle-exclamation me-1"></i> ' : '';

            // Note: backend query joins products, returning product_id, product_name, stock_quantity
            tr.innerHTML = `
                <td>#${item.product_id}</td>
                <td class="fw-bold">${item.product_name}</td>
                <td class="${stockClass}">${icon}${item.stock_quantity}</td>
                <td class="text-muted small">${item.warehouse_location || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="openUpdateModal(${item.product_id}, '${item.product_name.replace(/'/g, "\\'")}', ${item.stock_quantity})">
                        <i class="fa-solid fa-pen-to-square me-1"></i>Update Stock
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showNotification('Failed to load inventory', 'danger');
        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error loading inventory.</td></tr>`;
    }
}
