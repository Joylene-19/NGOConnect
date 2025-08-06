const axios = require('axios');

async function testTaskAttendanceEndpoint() {
  try {
    console.log('🧪 Testing Individual Task Attendance API');
    console.log('==========================================');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Login with test NGO
    console.log('🔑 Logging in as test NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testngo@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ NGO login successful');
    
    // First, get today's tasks to find a task ID
    console.log('📅 Getting todays tasks to find task ID...');
    const todaysTasksResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', { headers });
    
    if (todaysTasksResponse.data.length === 0) {
      console.log('❌ No tasks found for today');
      return;
    }
    
    const taskId = todaysTasksResponse.data[0].id;
    console.log('Found task ID:', taskId);
    console.log('Task title:', todaysTasksResponse.data[0].title);
    
    // Now test the individual task attendance endpoint
    console.log('\n🎯 Testing individual task attendance endpoint...');
    const taskAttendanceResponse = await axios.get(`http://localhost:3001/api/attendance/task/${taskId}`, { headers });
    
    console.log('\n📊 Task Attendance API Response:');
    console.log('Status:', taskAttendanceResponse.status);
    console.log('Data:', JSON.stringify(taskAttendanceResponse.data, null, 2));
    
    const data = taskAttendanceResponse.data;
    
    console.log('\n✅ Response Analysis:');
    console.log('- Task ID:', data.taskId);
    console.log('- Task Title:', data.taskTitle);
    console.log('- Task Date:', data.taskDate);
    console.log('- Volunteers Count:', data.volunteers.length);
    
    if (data.volunteers.length > 0) {
      console.log('\n👥 Volunteer Details:');
      data.volunteers.forEach((vol, index) => {
        console.log(`  ${index + 1}. ${vol.volunteerName} (${vol.volunteerEmail})`);
        console.log(`     Status: ${vol.attendanceStatus}`);
        console.log(`     Hours: ${vol.hoursCompleted}`);
        console.log(`     Tracking: ${vol.trackingStatus}`);
      });
      
      console.log('\n🎉 SUCCESS! Frontend should now work correctly:');
      console.log('- volunteers array is populated');
      console.log('- volunteers.map() will work without errors');
      console.log('- Each volunteer has volunteerName, volunteerEmail, etc.');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testTaskAttendanceEndpoint();
