const axios = require('axios');

async function testAttendanceWithCorrectData() {
  try {
    // Step 1: Login as NGO
    console.log('🔐 Logging in as NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ NGO logged in successfully');

    // Step 2: Check applications for the first task
    console.log('\n📋 Getting all applications for NGO tasks...');
    const applicationsResponse = await axios.get('http://localhost:3001/api/my-task-applications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📊 Found ${applicationsResponse.data.length} applications:`);
    applicationsResponse.data.slice(0, 3).forEach(app => {
      console.log(`  - Application ID: ${app.id}`);
      console.log(`    Task: ${app.task?.title || 'N/A'}`);
      console.log(`    Volunteer: ${app.volunteer?.name || 'N/A'}`);
      console.log(`    Status: ${app.status}`);
      console.log('');
    });

    // Step 3: If there are pending applications, approve one
    const pendingApp = applicationsResponse.data.find(app => app.status === 'pending');
    if (pendingApp) {
      console.log(`\n✅ Approving application ${pendingApp.id}...`);
      await axios.put(`http://localhost:3001/api/applications/${pendingApp.id}`, 
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Application approved');
    } else {
      console.log('\n📝 No pending applications to approve');
    }

    // Step 4: Test attendance API with a date that has approved volunteers
    const taskWithApproved = applicationsResponse.data.find(app => app.status === 'approved');
    if (taskWithApproved && taskWithApproved.task) {
      const taskDate = taskWithApproved.task.date;
      console.log(`\n📅 Testing attendance API for task date: ${taskDate}`);
      
      const attendanceResponse = await axios.get(`http://localhost:3001/api/attendance/tasks/${taskDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`📊 Attendance data for ${taskDate}:`);
      console.log(JSON.stringify(attendanceResponse.data, null, 2));
    }

    // Step 5: Test marking attendance
    if (taskWithApproved) {
      console.log(`\n📝 Testing attendance marking...`);
      const attendanceData = {
        taskId: taskWithApproved.task.id,
        volunteerId: taskWithApproved.volunteer.id,
        status: 'present',
        notes: 'Test attendance marking'
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

    console.log('\n✅ Test completed successfully');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAttendanceWithCorrectData();
