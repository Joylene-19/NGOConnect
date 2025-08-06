import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication...\n');

    // Test NGO login
    const ngoAuth = {
      email: 'contact@oceanguardians.org',
      password: 'password'
    };

    console.log('Testing NGO login...');
    const ngoLogin = await axios.post(`${BASE_URL}/api/login`, ngoAuth);
    console.log('NGO Login Response:', ngoLogin.data);

    // Test volunteer login  
    const volunteerAuth = {
      email: 'sarah.johnson@email.com',
      password: 'password'
    };

    console.log('\nTesting Volunteer login...');
    const volunteerLogin = await axios.post(`${BASE_URL}/api/login`, volunteerAuth);
    console.log('Volunteer Login Response:', volunteerLogin.data);

    // Test API call with token
    console.log('\nTesting API call with NGO token...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
      headers: { 
        Authorization: `Bearer ${ngoLogin.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Tasks Response:', tasksResponse.data.length, 'tasks found');

  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
  }
}

testAuth();
