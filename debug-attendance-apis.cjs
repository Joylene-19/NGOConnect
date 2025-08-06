const axios = require('axios');

async function debugAttendanceAPI() {
  try {
    // Step 1: Login as NGO
    console.log('🔐 Logging in as NGO...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ NGO logged in successfully');

    // Step 2: Check what tasks exist for this NGO
    console.log('\n📋 Getting all tasks for this NGO...');
    const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📊 Found ${tasksResponse.data.length} tasks:`);
    tasksResponse.data.slice(0, 3).forEach(task => {
      console.log(`  - Task: ${task.title}`);
      console.log(`    Date: ${task.date}`);
      console.log(`    Status: ${task.status}`);
      console.log(`    Applied: ${task.appliedVolunteers?.length || 0}`);
      console.log(`    Approved: ${task.approvedVolunteers?.length || 0}`);
      console.log('');
    });

    // Step 3: Test today's attendance API
    console.log('\n🗓️ Testing today\'s attendance API...');
    const todayResponse = await axios.get('http://localhost:3001/api/attendance/tasks/today', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📊 Today's tasks response: ${JSON.stringify(todayResponse.data, null, 2)}`);

    // Step 4: Test specific date API with a date that has tasks
    if (tasksResponse.data.length > 0) {
      const taskDate = tasksResponse.data[0].date;
      console.log(`\n📅 Testing specific date API for: ${taskDate}`);
      
      const dateResponse = await axios.get(`http://localhost:3001/api/attendance/tasks/${taskDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`📊 Date-specific tasks response: ${JSON.stringify(dateResponse.data, null, 2)}`);
    }

    console.log('\n✅ Debug completed successfully');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

debugAttendanceAPI();
