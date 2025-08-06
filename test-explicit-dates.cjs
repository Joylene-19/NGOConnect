const axios = require('axios');

async function testWithExplicitDates() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testing Auto-Close with Explicit Past Dates...\n');

    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test with an obviously past date (August 1, 2025)
    console.log('📋 Creating task for August 1, 2025 (clearly in the past)...');
    
    const pastTaskResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Clearly Past Task',
      description: 'This task is for August 1st and should be auto-closed',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      date: '2025-08-01', // Explicitly past date
      hours: 4,
      category: 'Testing'
    }, { headers });

    console.log('✅ Past task created with ID:', pastTaskResponse.data.id);
    console.log('📅 Task date:', pastTaskResponse.data.date);
    console.log('📊 Initial status:', pastTaskResponse.data.status);

    // Wait a moment and then fetch to see if auto-close works
    console.log('\n🔍 Fetching task again to check auto-close...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const fetchResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const fetchedTask = fetchResponse.data.find(t => t.id === pastTaskResponse.data.id);
    
    if (fetchedTask) {
      console.log('📊 Status after fetch:', fetchedTask.status);
      console.log('📊 Task status after fetch:', fetchedTask.taskStatus);
    } else {
      console.log('❌ Task not found in fetch response');
    }

    // Test volunteer trying to apply
    console.log('\n👤 Testing volunteer application to past task...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };

    try {
      const applicationResponse = await axios.post(`${baseURL}/tasks/${pastTaskResponse.data.id}/apply`, {
        motivation: 'I want to help with this task'
      }, { headers: volunteerHeaders });
      console.log('❌ Application should have been blocked! Response:', applicationResponse.data);
    } catch (error) {
      console.log('✅ Application correctly blocked:', error.response?.data?.error || error.message);
    }

    // Check volunteer available tasks
    console.log('\n👁️  Checking volunteer available tasks...');
    const availableResponse = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const availableTask = availableResponse.data.find(t => t.id === pastTaskResponse.data.id);
    
    console.log('Past task visible in available tasks:', availableTask ? 'YES (❌ WRONG)' : 'NO (✅ CORRECT)');

    // Clean up
    await axios.delete(`${baseURL}/tasks/${pastTaskResponse.data.id}`, { headers });
    console.log('\n🧹 Test task cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testWithExplicitDates();
