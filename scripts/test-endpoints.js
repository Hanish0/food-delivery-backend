const axios = require('axios');
require('dotenv').config();

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';
const DELIVERY_SERVICE = process.env.DELIVERY_SERVICE_URL || 'http://localhost:3003';

async function testEndpoints() {
  console.log('Testing API endpoints...\n');

  try {
    // Test health endpoints
    console.log('1. Testing health endpoints...');
    const healthChecks = await Promise.all([
      axios.get(`${USER_SERVICE}/health`),
      axios.get(`${RESTAURANT_SERVICE}/health`),
      axios.get(`${DELIVERY_SERVICE}/health`)
    ]);

    healthChecks.forEach((response, index) => {
      const services = ['User', 'Restaurant', 'Delivery'];
      console.log(`   ${services[index]} Service: ${response.data.status}`);
    });

    // Test available restaurants
    console.log('\n2. Testing available restaurants...');
    const restaurants = await axios.get(`${USER_SERVICE}/api/restaurants/available`);
    console.log(`   Found ${restaurants.data.length} available restaurants`);

    if (restaurants.data.length > 0) {
      const restaurant = restaurants.data[0];
      console.log(`   Sample restaurant: ${restaurant.name}`);

      // Test restaurant menu
      console.log('\n3. Testing restaurant menu...');
      const menu = await axios.get(`${USER_SERVICE}/api/restaurants/${restaurant.id}/menu`);
      console.log(`   Menu has ${menu.data.length} items`);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEndpoints();