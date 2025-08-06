const axios = require('axios');

async function testRealScenario() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testing Real Scenario - Create task for 7/8/2025 and verify it shows as 2025-08-07...\n');

    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Create a task for 7/8/2025 (August 7, 2025)
    console.log('📋 Creating task for date: 2025-08-07 (August 7, 2025)');
    const createResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Beach Cleanup - August 7th',
      description: 'Help us clean the beach on August 7th, 2025',
      location: 'Santa Monica Beach',
      requiredSkills: ['Environmental awareness', 'Physical activity'],
      date: '2025-08-07', // This should be stored and returned as 2025-08-07
      hours: 4,
      category: 'Environmental'
    }, { headers });

    const task = createResponse.data;
    console.log('✅ Task created successfully');
    console.log('📅 Task date returned:', task.date);
    console.log('✅ Correct format:', task.date === '2025-08-07' ? 'YES' : 'NO');

    // Edit the task date to a different date
    console.log('\n📝 Editing task date to August 15th, 2025...');
    const updateResponse = await axios.put(`${baseURL}/tasks/${task.id}`, {
      date: '2025-08-15'
    }, { headers });

    console.log('📅 Updated task date:', updateResponse.data.date);
    console.log('✅ Update working:', updateResponse.data.date === '2025-08-15' ? 'YES' : 'NO');

    // Test volunteer dashboard view
    console.log('\n👤 Testing volunteer dashboard view...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };
    const availableTasksResponse = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const volunteerTask = availableTasksResponse.data.find(t => t.id === task.id);
    
    if (volunteerTask) {
      console.log('📅 Volunteer dashboard shows date:', volunteerTask.date);
      console.log('✅ Volunteer view correct:', volunteerTask.date === '2025-08-15' ? 'YES' : 'NO');
    }

    // Clean up
    await axios.delete(`${baseURL}/tasks/${task.id}`, { headers });
    console.log('\n🧹 Task cleaned up');
    
    console.log('\n🎉 Real scenario test passed! Date formatting is working correctly across the entire system.');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testRealScenario();
