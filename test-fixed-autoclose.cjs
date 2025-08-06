const axios = require('axios');

async function testFixedAutoClose() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🔧 Testing Fixed Auto-Close with August 5th Task\n');

    // Login as NGO
    console.log('🏢 Logging in as NGO...');
    const ngoLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const ngoHeaders = { Authorization: `Bearer ${ngoLogin.data.token}` };

    // Create a task for August 5th (should auto-close now with <= logic)
    console.log('📋 Creating task for August 5th, 2025...');
    const taskResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Fixed Auto-Close Test - August 5th',
      description: 'Testing the updated auto-close logic with <= comparison',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      date: '2025-08-05',
      hours: 4,
      category: 'Testing'
    }, { headers: ngoHeaders });

    console.log(`✅ Task created with ID: ${taskResponse.data.id}`);
    console.log(`📅 Task date: ${taskResponse.data.date}`);
    console.log(`📊 Initial status: ${taskResponse.data.status}\n`);

    // Wait a moment and fetch tasks to trigger auto-close
    console.log('🔍 Fetching tasks to trigger auto-close...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tasksResponse = await axios.get(`${baseURL}/tasks`, { headers: ngoHeaders });
    const updatedTask = tasksResponse.data.find(t => t.id === taskResponse.data.id);
    
    console.log('📊 Task Status After Auto-Close Check:');
    if (updatedTask) {
      console.log(`   Status: ${updatedTask.status}`);
      console.log(`   Task Status: ${updatedTask.taskStatus || 'Not set'}`);
      console.log(`   ${updatedTask.status === 'closed' ? '✅ CORRECTLY CLOSED' : '❌ STILL OPEN'}`);
    } else {
      console.log('   ❌ Task not found');
    }

    // Test volunteer perspective
    console.log('\n👤 Testing volunteer experience...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };

    // Check available tasks
    const availableResponse = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const taskVisible = availableResponse.data.find(t => t.id === taskResponse.data.id);
    
    console.log(`📋 Task visible in available list: ${taskVisible ? '❌ YES (WRONG)' : '✅ NO (CORRECT)'}`);

    // Try to apply
    try {
      await axios.post(`${baseURL}/tasks/${taskResponse.data.id}/apply`, {
        motivation: 'Testing application to closed task'
      }, { headers: volunteerHeaders });
      console.log('🔓 Application: ❌ SHOULD HAVE BEEN BLOCKED');
    } catch (error) {
      console.log('🔒 Application: ✅ CORRECTLY BLOCKED');
      console.log(`   Error: "${error.response?.data?.error}"`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await axios.delete(`${baseURL}/tasks/${taskResponse.data.id}`, { headers: ngoHeaders });
    console.log('✅ Test task cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testFixedAutoClose();
