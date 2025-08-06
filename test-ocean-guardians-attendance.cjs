const axios = require('axios');

async function testOceanGuardiansAttendance() {
  try {
    console.log('🧪 Testing Attendance API with Ocean Guardians NGO');
    console.log('=================================================');
    
    // Wait for server
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Login as Ocean Guardians NGO
    console.log('🔑 Logging in as Ocean Guardians...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const ngoId = loginResponse.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Ocean Guardians login successful');
    console.log('NGO ID:', ngoId);
    console.log('NGO Name:', loginResponse.data.user.name);
    
    // Get today's tasks to find the task ID
    console.log('\\n📅 Getting tasks for today...');
    const todaysTasksResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', { headers });
    console.log('Tasks found:', todaysTasksResponse.data.length);
    
    if (todaysTasksResponse.data.length === 0) {
      console.log('❌ No tasks found for Ocean Guardians today');
      return;
    }
    
    const task = todaysTasksResponse.data[0];
    console.log('Task:', task.title);
    console.log('Task ID:', task.id);
    console.log('Volunteers:', task.volunteers.length);
    
    // Now test the individual task attendance endpoint
    console.log('\\n🎯 Testing individual task attendance API...');
    const taskAttendanceResponse = await axios.get(`http://localhost:3001/api/attendance/task/${task.id}`, { headers });
    
    console.log('\\n📊 Individual Task API Response:');
    console.log('Status:', taskAttendanceResponse.status);
    console.log('Data:', JSON.stringify(taskAttendanceResponse.data, null, 2));
    
    const attendanceData = taskAttendanceResponse.data;
    
    console.log('\\n✅ Frontend Compatibility Check:');
    console.log('- Has taskId?', !!attendanceData.taskId);
    console.log('- Has taskTitle?', !!attendanceData.taskTitle);
    console.log('- Has volunteers array?', Array.isArray(attendanceData.volunteers));
    console.log('- Volunteers count:', attendanceData.volunteers?.length || 0);
    
    if (attendanceData.volunteers && attendanceData.volunteers.length > 0) {
      console.log('\\n👥 Volunteer details:');
      attendanceData.volunteers.forEach((vol, index) => {
        console.log(`  ${index + 1}. ${vol.volunteerName} (${vol.volunteerEmail})`);
        console.log(`     Status: ${vol.attendanceStatus}`);
        console.log(`     ID: ${vol.volunteerId}`);
      });
      
      console.log('\\n🎉 SUCCESS! API response is correctly formatted for frontend!');
      console.log('The volunteers.map() error should now be fixed.');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testOceanGuardiansAttendance();
