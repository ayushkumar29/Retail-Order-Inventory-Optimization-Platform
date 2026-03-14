async function initSuppliers() {
    loadSuppliers();

    const supplierForm = document.getElementById('supplier-form');
    if (supplierForm) {
        supplierForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('supplierName').value;
            const email = document.getElementById('supplierEmail').value;

            try {
                await createSupplier({ 
                    supplier_name: name, 
                    contact_email: email 
                });
                showNotification('Supplier added successfully!', 'success');
                
                // Hide the form collapse
                const collapseElement = document.getElementById('addSupplierForm');
                const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement);
                if (bsCollapse) bsCollapse.hide();
                
                supplierForm.reset();
                loadSuppliers();
            } catch (error) {
                showNotification(error.message || 'Failed to add supplier', 'danger');
            }
        });
    }
}

async function loadSuppliers() {
    try {
        const suppliers = await getSuppliers();
        const tbody = document.getElementById('suppliers-table-body');
        tbody.innerHTML = '';

        if (suppliers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No suppliers found.</td></tr>`;
            return;
        }

        suppliers.forEach(supplier => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${supplier.supplier_id}</td>
                <td class="fw-bold">${supplier.supplier_name}</td>
                <td><a href="mailto:${supplier.contact_email}">${supplier.contact_email}</a></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteSupplier(${supplier.supplier_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showNotification('Failed to load suppliers', 'danger');
        const tbody = document.getElementById('suppliers-table-body');
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Error loading suppliers.</td></tr>`;
    }
}

window.handleDeleteSupplier = async function(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
        await deleteSupplier(id);
        showNotification('Supplier deleted successfully', 'success');
        loadSuppliers();
    } catch (error) {
        showNotification(error.message || 'Delete failed', 'danger');
    }
}
