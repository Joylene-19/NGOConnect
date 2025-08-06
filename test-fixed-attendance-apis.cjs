const axios = require('axios');

async function testFixedAttendanceAPIs() {
  try {
    console.log('🧪 Testing Fixed Attendance APIs');
    console.log('==================================');
    
    // First, login to get NGO token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'ngo@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ NGO login successful');
    
    // Test today's tasks endpoint
    console.log('\n📅 Testing todays tasks endpoint...');
    const todayResponse = await axios.get('http://localhost:3001/api/attendance/tasks/today', { headers });
    console.log('Todays tasks response:', JSON.stringify(todayResponse.data, null, 2));
    
    // Test specific date endpoint
    console.log('\n📅 Testing specific date endpoint (2025-08-07)...');
    const dateResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', { headers });
    console.log('Date tasks response:', JSON.stringify(dateResponse.data, null, 2));
    
    // Summary
    console.log('\n📊 API Test Summary:');
    console.log(`- Todays tasks: ${todayResponse.data.length} tasks found`);
    console.log(`- Date 2025-08-07 tasks: ${dateResponse.data.length} tasks found`);
    
    if (dateResponse.data.length > 0) {
      const task = dateResponse.data[0];
      console.log(`- First task: "${task.title}" with ${task.volunteers.length} volunteers`);
      if (task.volunteers.length > 0) {
        console.log(`- First volunteer: ${task.volunteers[0].name} (${task.volunteers[0].attendanceStatus})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

testFixedAttendanceAPIs();
