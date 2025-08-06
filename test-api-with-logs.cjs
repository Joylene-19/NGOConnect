const axios = require('axios');

async function testAttendanceAPIWithLogs() {
  try {
    console.log('🧪 Testing Attendance API with detailed logging');
    console.log('==============================================');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Login with test NGO
    console.log('🔑 Logging in as test NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testngo@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const ngoId = loginResponse.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ NGO login successful');
    console.log('NGO ID:', ngoId);
    console.log('NGO Name:', loginResponse.data.user.name);
    
    // Test specific date endpoint with detailed response
    console.log('\\n📅 Testing attendance API for date 2025-08-07...');
    const dateResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', { headers });
    
    console.log('\\n📊 API Response:');
    console.log('Status:', dateResponse.status);
    console.log('Data:', JSON.stringify(dateResponse.data, null, 2));
    
    if (dateResponse.data.length > 0) {
      console.log('\\n🎉 SUCCESS! Found attendance tasks:');
      dateResponse.data.forEach((task, index) => {
        console.log(`\\nTask ${index + 1}:`);
        console.log(`  Title: ${task.title}`);
        console.log(`  ID: ${task.id}`);
        console.log(`  Date: ${task.date}`);
        console.log(`  Volunteers: ${task.volunteers.length}`);
        
        if (task.volunteers.length > 0) {
          console.log('  Volunteer Details:');
          task.volunteers.forEach((vol, volIndex) => {
            console.log(`    ${volIndex + 1}. ${vol.name} (${vol.email})`);
            console.log(`       Status: ${vol.attendanceStatus}`);
            console.log(`       Application ID: ${vol.applicationId}`);
          });
        }
      });
      
      // This should fix the frontend error - volunteers array is now populated
      console.log('\\n✅ The API is now returning volunteers array properly!');
      console.log('   Frontend should be able to call volunteers.map() without errors.');
      
    } else {
      console.log('\\n❌ No tasks found - there might still be an issue');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testAttendanceAPIWithLogs();
