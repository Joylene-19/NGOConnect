const axios = require('axios');

async function testAttendanceDirectly() {
  try {
    // Step 1: Login as NGO
    console.log('🔐 Logging in as NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ NGO logged in successfully');

    // Step 2: Test attendance API with the date that has an approved volunteer (2025-08-15)
    console.log('\n📅 Testing attendance API for 2025-08-15 (has approved volunteer)...');
    
    const attendanceResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-15', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📊 Attendance data for 2025-08-15:`);
    console.log(JSON.stringify(attendanceResponse.data, null, 2));

    // Step 3: If we have data, test marking attendance
    if (attendanceResponse.data.length > 0) {
      const task = attendanceResponse.data[0];
      if (task.volunteers && task.volunteers.length > 0) {
        const volunteer = task.volunteers[0];
        
        console.log(`\n📝 Testing attendance marking for volunteer ${volunteer.name}...`);
        const attendanceData = {
          taskId: task.id,
          volunteerId: volunteer.id,
          status: 'present',
          notes: 'Test attendance marking via API'
        };

        try {
          const markResponse = await axios.post('http://localhost:3001/api/attendance', 
            attendanceData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('✅ Attendance marked successfully:', markResponse.data);

          // Test the API again to see updated status
          console.log('\n🔄 Re-testing attendance API to see updated status...');
          const updatedResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-15', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('📊 Updated attendance data:', JSON.stringify(updatedResponse.data, null, 2));

        } catch (markError) {
          console.log('❌ Error marking attendance:', markError.response?.data || markError.message);
        }
      }
    }

    console.log('\n✅ Test completed successfully');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAttendanceDirectly();
