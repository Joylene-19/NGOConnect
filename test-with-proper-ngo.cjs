const axios = require('axios');

async function createTestNGOAndTest() {
  try {
    console.log('🔧 Setting up test NGO and testing attendance APIs');
    console.log('================================================');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create test NGO user
    console.log('📝 Creating test NGO user...');
    try {
      const signupResponse = await axios.post('http://localhost:3001/api/auth/signup', {
        name: 'Test NGO',
        email: 'testngo@example.com',
        password: 'password123',
        role: 'ngo'
      });
      console.log('✅ NGO user created successfully');
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ NGO user already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Login with NGO
    console.log('🔑 Logging in as NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testngo@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const ngoId = loginResponse.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ NGO login successful, NGO ID:', ngoId);
    
    // Test today's tasks endpoint
    console.log('\n📅 Testing todays tasks endpoint...');
    const todayResponse = await axios.get('http://localhost:3001/api/attendance/tasks/today', { headers });
    console.log('Todays tasks:', todayResponse.data.length, 'tasks found');
    
    // Test specific date endpoint (2025-08-07)
    console.log('\n📅 Testing specific date endpoint (2025-08-07)...');
    const dateResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', { headers });
    console.log('Date 2025-08-07 tasks:', dateResponse.data.length, 'tasks found');
    
    if (dateResponse.data.length > 0) {
      console.log('📋 Task details:');
      dateResponse.data.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} - ${task.volunteers.length} volunteers`);
        task.volunteers.forEach((vol, volIndex) => {
          console.log(`     ${volIndex + 1}. ${vol.name} (${vol.attendanceStatus})`);
        });
      });
    } else {
      console.log('⚠️ No tasks found. The joy test 2 task might not belong to this NGO.');
      console.log('   NGO ID from login:', ngoId);
      console.log('   Expected NGO ID: 6867db7a8d444eed1cdcf813');
      
      if (ngoId !== '6867db7a8d444eed1cdcf813') {
        console.log('\n🔄 The joy test 2 task belongs to a different NGO. Let me check existing NGO users...');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestNGOAndTest();
