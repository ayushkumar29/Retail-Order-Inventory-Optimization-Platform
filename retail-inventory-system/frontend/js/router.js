/**
 * Simple SPA Router for Vanilla JS
 */
const routes = {
    '/': { title: 'Dashboard', view: DashboardView, init: initDashboard },
    '/products': { title: 'Products', view: ProductsView, init: initProducts },
    '/inventory': { title: 'Inventory', view: InventoryView, init: initInventory },
    '/suppliers': { title: 'Suppliers', view: SuppliersView, init: initSuppliers },
    '/reports': { title: 'Reports', view: ReportsView, init: initReports },
    '/orders': { title: 'Orders', view: OrdersView, init: initOrders }
};

const navigateTo = (url) => {
    window.location.hash = url;
};

const router = async () => {
    // Get current path from hash or default to /
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path] || routes['/'];

    // Update the UI
    document.title = `${route.title} - Retail Analytics`;
    const appContainer = document.getElementById('app');
    
    // Injects the view HTML template
    appContainer.innerHTML = route.view();

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${path}`) {
            link.classList.add('active');
        }
    });

    // Run the initialization logic for the page
    if (route.init) {
        route.init();
    }
    
    // Auto-close mobile navbar on navigate
    const navBarCollapse = document.getElementById('navbarNav');
    if (navBarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navBarCollapse);
        if (bsCollapse) bsCollapse.hide();
    }
};

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Handle programmatic navigation
document.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
        // Handled naturally by hash change listeners
    }
});
