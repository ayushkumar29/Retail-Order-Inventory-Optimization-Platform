const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testProductAndOrderFixes() {
    console.log('--- Testing Product Modification and Order Deletion Fixes ---');
    try {
        // Get initial products and orders
        console.log('\n[1] Getting initial data...');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        const ordersResponse = await axios.get(`${BASE_URL}/orders`);
        
        console.log(`Found ${productsResponse.data.data.length} products`);
        console.log(`Found ${ordersResponse.data.data.length} orders`);
        
        if (productsResponse.data.data.length === 0) {
            console.log('❌ No products found to test with');
            return;
        }
        
        // Test product update
        console.log('\n[2] Testing product update...');
        const testProduct = productsResponse.data.data[0];
        console.log(`Testing with product: ${testProduct.name} (ID: ${testProduct.product_id})`);
        
        const updateData = {
            name: `Updated ${testProduct.name}`,
            category: testProduct.category,
            price: parseFloat(testProduct.price) + 10,
            supplier_id: testProduct.supplier_id
        };
        
        console.log('Update data:', updateData);
        
        const updateResponse = await axios.put(`${BASE_URL}/products/${testProduct.product_id}`, updateData);
        console.log(`Update Status: ${updateResponse.status}`);
        console.log('Update Response:', updateResponse.data);
        
        // Verify the update
        const verifyResponse = await axios.get(`${BASE_URL}/products`);
        const updatedProduct = verifyResponse.data.data.find(p => p.product_id === testProduct.product_id);
        if (updatedProduct && updatedProduct.name === updateData.name) {
            console.log('✅ PASS: Product update successful');
        } else {
            console.log('❌ FAIL: Product update not reflected');
        }
        
        // Test order deletion if orders exist
        if (ordersResponse.data.data.length > 0) {
            console.log('\n[3] Testing order deletion...');
            const testOrder = ordersResponse.data.data[0];
            console.log(`Testing with order: ${testOrder.order_id} for customer ${testOrder.customer_name}`);
            
            const deleteResponse = await axios.delete(`${BASE_URL}/orders/${testOrder.order_id}`);
            console.log(`Delete Status: ${deleteResponse.status}`);
            console.log('Delete Response:', deleteResponse.data);
            
            // Verify the deletion
            const verifyOrdersResponse = await axios.get(`${BASE_URL}/orders`);
            const deletedOrder = verifyOrdersResponse.data.data.find(o => o.order_id === testOrder.order_id);
            if (!deletedOrder) {
                console.log('✅ PASS: Order deletion successful');
            } else {
                console.log('❌ FAIL: Order still exists after deletion');
            }
        } else {
            console.log('\n[3] No orders found to test deletion');
        }
        
        // Test error cases
        console.log('\n[4] Testing error cases...');
        
        // Test updating non-existent product
        try {
            await axios.put(`${BASE_URL}/products/99999`, { name: 'Test', price: 10 });
            console.log('❌ FAIL: Should have failed for non-existent product');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ PASS: Correctly returned 404 for non-existent product');
            } else {
                console.log('❌ FAIL: Unexpected error for non-existent product:', error.message);
            }
        }
        
        // Test deleting non-existent order
        try {
            await axios.delete(`${BASE_URL}/orders/99999`);
            console.log('❌ FAIL: Should have failed for non-existent order');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ PASS: Correctly returned 404 for non-existent order');
            } else {
                console.log('❌ FAIL: Unexpected error for non-existent order:', error.message);
            }
        }
        
        console.log('\n--- All Fix Tests Completed ---');
        
    } catch (error) {
        console.error('\n❌ Fix test execution failed!');
        if (error.code === 'ECONNREFUSED') {
            console.error('Make sure your Node server (server.js) is currently running on port 3000!');
        } else if (error.response) {
            console.error('Response Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testProductAndOrderFixes();
