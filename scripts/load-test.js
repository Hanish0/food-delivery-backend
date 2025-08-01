const axios = require('axios');
require('dotenv').config();

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';

async function loadTest() {
  console.log('Starting load test...');

  const requests = [];
  const concurrentUsers = 10;
  const requestsPerUser = 5;

  for (let user = 0; user < concurrentUsers; user++) {
    for (let req = 0; req < requestsPerUser; req++) {
      requests.push(
        axios.get(`${USER_SERVICE}/api/restaurants/available`)
          .then(response => ({ success: true, status: response.status }))
          .catch(error => ({ success: false, error: error.message }))
      );
    }
  }

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const endTime = Date.now();

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const duration = endTime - startTime;

  console.log(`\nLoad Test Results:`);
  console.log(`Total requests: ${requests.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Requests per second: ${(requests.length / duration * 1000).toFixed(2)}`);
}

loadTest().catch(console.error);