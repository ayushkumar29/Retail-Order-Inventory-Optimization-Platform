const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('--- Starting API Tests ---');
    try {
        // --- 1. Test GET Products ---
        console.log('\n[1] Testing GET /products...');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        console.log(`Status: ${productsResponse.status}`);
        console.log(`Data count: ${productsResponse.data.data.length} products found`);

        // --- 2. Test GET Inventory ---
        console.log('\n[2] Testing GET /inventory...');
        const inventoryResponse = await axios.get(`${BASE_URL}/inventory`);
        console.log(`Status: ${inventoryResponse.status}`);
        const luminaTvStock = inventoryResponse.data.data.find(inv => inv.product_id === 1);
        console.log(`Stock for Lumina 4K TV (Product 1): ${luminaTvStock ? luminaTvStock.stock_quantity : 'Not found'}`);
        
        let initialStock = luminaTvStock.stock_quantity;


        // --- 3. Test Business Rule: Successful Order Reduces Stock ---
        console.log('\n[3] Testing Business Rule: Valid Order Creation...');
        console.log(`Attempting to buy 2 Lumina TVs.`);
        const validOrderResponse = await axios.post(`${BASE_URL}/orders`, {
            customer_name: "Integration Test User",
            items: [
                {
                    product_id: 1, // Lumina TV
                    quantity: 2
                }
            ]
        });
        console.log(`Status: ${validOrderResponse.status}`);
        console.log('Order Data:', validOrderResponse.data);

        // Verify stock was reduced
        console.log('\n[4] Verifying Inventory Reduction...');
        const invCheckResponse = await axios.get(`${BASE_URL}/inventory`);
        const updatedLuminaTvStock = invCheckResponse.data.data.find(inv => inv.product_id === 1);
        console.log(`Previous Stock: ${initialStock} | New Stock: ${updatedLuminaTvStock.stock_quantity}`);
        if(updatedLuminaTvStock.stock_quantity === initialStock - 2) {
            console.log('✅ PASS: Inventory correctly reduced by 2.');
        } else {
            console.log('❌ FAIL: Inventory reduction rule failed.');
        }


        // --- 5. Test Business Rule: Prevent Stock-out (Ordering more than available) ---
        console.log('\n[5] Testing Business Rule: Prevent ordering more than stock...');
        console.log(`Attempting to buy 9999 units of Product 2 (which should fail)...`);
        try {
            await axios.post(`${BASE_URL}/orders`, {
                customer_name: "Greedy Buyer",
                items: [
                    {
                        product_id: 2, 
                        quantity: 9999
                    }
                ]
            });
            console.log('❌ FAIL: Order went through despite insufficient stock!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Error Message: ${error.response.data.error}`);
                console.log('✅ PASS: System prevented stock-out correctly.');
            } else {
                console.log(`❌ FAIL: Unexpected error occurred: ${error.message}`);
            }
        }

        // --- 6. Test Business Rule: Update Order Status ---
        console.log('\n[6] Testing Business Rule: Update Order Status...');
        const orderIdToUpdate = validOrderResponse.data.data.orderId;
        console.log(`Attempting to mark Order ID ${orderIdToUpdate} as 'Completed'...`);
        const updateStatusResponse = await axios.put(`${BASE_URL}/orders/${orderIdToUpdate}/status`, {
            status: 'Completed'
        });
        console.log(`Status: ${updateStatusResponse.status}`);
        console.log('Update Data:', updateStatusResponse.data);

        // --- 6.5. Test Business Rule: Prevent 0 Quantity Orders ---
        console.log('\n[6.5] Testing Business Rule: Prevent 0 Quantity...');
        console.log(`Attempting to buy 0 units of Product 1 (which should fail)...`);
        try {
            await axios.post(`${BASE_URL}/orders`, {
                customer_name: "Zero Buyer",
                items: [
                    {
                        product_id: 1, 
                        quantity: 0
                    }
                ]
            });
            console.log('❌ FAIL: Order went through with 0 quantity!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(`Status: ${error.response.status}`);
                console.log(`Error Message: ${error.response.data.error}`);
                console.log('✅ PASS: System prevented 0 quantity order correctly.');
            } else {
                console.log(`❌ FAIL: Unexpected error occurred: ${error.message}`);
            }
        }

        // --- 7. Test Business Rule: Top Products ---
        console.log('\n[7] Testing Business Rule: Get Top Selling Products...');
        const topProductsResponse = await axios.get(`${BASE_URL}/products/top?limit=3`);
        console.log(`Status: ${topProductsResponse.status}`);
        console.log(`Data count: ${topProductsResponse.data.data.length} top products found`);
        console.dir(topProductsResponse.data.data);

        // --- 8. Test Business Rule: Low Stock ---
        console.log('\n[8] Testing Business Rule: Get Low Stock Items...');
        const lowStockResponse = await axios.get(`${BASE_URL}/inventory/low-stock?threshold=50`);
        console.log(`Status: ${lowStockResponse.status}`);
        console.log(`Data count: ${lowStockResponse.data.data.length} low stock items found`);
        console.dir(lowStockResponse.data.data);

        // --- 9. Test Business Rule: Order History ---
        console.log('\n[9] Testing Business Rule: Get Order History for a Customer...');
        const historyResponse = await axios.get(`${BASE_URL}/orders/history/Integration%20Test%20User`);
        console.log(`Status: ${historyResponse.status}`);
        console.log(`Data count: ${historyResponse.data.data.length} orders found for this customer`);
        console.dir(historyResponse.data.data, { depth: null });

        console.log('\n--- All Tests Completed Successfully ---');

    } catch (error) {
        console.error('\n❌ Test Script execution failed!');
        if (error.code === 'ECONNREFUSED') {
            console.error('Make sure your Node server (server.js) is currently running on port 3000!');
        } else if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testAPI();
