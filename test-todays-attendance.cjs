const axios = require('axios');

async function testTodaysAttendanceAPI() {
  try {
    // Step 1: Login as NGO
    console.log('🔐 Logging in as NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ NGO logged in successfully');

    // Step 2: Test today's attendance API (2025-08-07)
    console.log('\n📅 Testing attendance API for today (2025-08-07)...');
    
    const todayResponse = await axios.get('http://localhost:3001/api/attendance/tasks/today', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Today\'s attendance tasks:');
    console.log(JSON.stringify(todayResponse.data, null, 2));

    // Step 3: Test specific date API for 2025-08-07
    console.log('\n📅 Testing attendance API for 2025-08-07 (joy test 2 date)...');
    
    const dateResponse = await axios.get('http://localhost:3001/api/attendance/tasks/2025-08-07', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Attendance data for 2025-08-07:');
    console.log(JSON.stringify(dateResponse.data, null, 2));

    // Step 4: If we have volunteers, test marking attendance
    if (dateResponse.data.length > 0) {
      const task = dateResponse.data[0];
      if (task.volunteers && task.volunteers.length > 0) {
        const volunteer = task.volunteers[0];
        
        console.log(`\n📝 Testing attendance marking for volunteer ${volunteer.name}...`);
        const attendanceData = {
          taskId: task.id,
          volunteerId: volunteer.id,
          status: 'present',
          notes: 'Test attendance marking - volunteer attended successfully'
        };

        try {
          const markResponse = await axios.post('http://localhost:3001/api/attendance', 
            attendanceData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('✅ Attendance marked successfully:', markResponse.data);

        } catch (markError) {
          console.log('❌ Error marking attendance:', markError.response?.data || markError.message);
        }
      }
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testTodaysAttendanceAPI();
