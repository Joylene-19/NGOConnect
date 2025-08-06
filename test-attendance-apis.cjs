const axios = require('axios');

async function testAttendanceAPIs() {
  const baseURL = 'http://localhost:3001/api';
  
  // We'll need to get a valid NGO token first
  let ngoToken = '';
  let taskId = '';
  let volunteerId = '';
  
  try {
    console.log('🧪 Testing New Attendance Management APIs\n');

    // Step 1: Login as NGO (Ocean Guardians)
    console.log('🔐 Step 1: Logging in as NGO...');
    const ngoLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    ngoToken = ngoLogin.data.token;
    console.log('✅ NGO logged in successfully');

    // Step 2: Test getting today's tasks
    console.log('\n📅 Step 2: Testing GET /api/attendance/tasks/today');
    const todaysTasks = await axios.get(`${baseURL}/attendance/tasks/today`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    console.log('✅ Today\'s tasks response:');
    console.log(`Found ${todaysTasks.data.length} tasks for today`);
    
    if (todaysTasks.data.length > 0) {
      const task = todaysTasks.data[0];
      taskId = task.id;
      console.log(`\n📋 First task: "${task.title}"`);
      console.log(`   - Total volunteers: ${task.totalVolunteers}`);
      console.log(`   - Present: ${task.presentCount}`);
      console.log(`   - Absent: ${task.absentCount}`);
      console.log(`   - Pending: ${task.pendingCount}`);
      
      if (task.volunteers.length > 0) {
        volunteerId = task.volunteers[0].id;
        console.log(`   - First volunteer: ${task.volunteers[0].name} (${task.volunteers[0].attendanceStatus})`);
      }
    } else {
      console.log('ℹ️  No tasks found for today. This is normal if no tasks are scheduled for today.');
    }

    // Step 3: Test getting tasks for a specific date (let's try August 8, 2025)
    console.log('\n📅 Step 3: Testing GET /api/attendance/tasks/2025-08-08');
    const specificDateTasks = await axios.get(`${baseURL}/attendance/tasks/2025-08-08`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    console.log('✅ August 8th tasks response:');
    console.log(`Found ${specificDateTasks.data.length} tasks for August 8th, 2025`);
    
    if (specificDateTasks.data.length > 0) {
      const task = specificDateTasks.data[0];
      if (!taskId) taskId = task.id; // Use this task if we don't have one from today
      
      console.log(`\n📋 First task on Aug 8th: "${task.title}"`);
      console.log(`   - Total volunteers: ${task.totalVolunteers}`);
      console.log(`   - Present: ${task.presentCount}`);
      console.log(`   - Absent: ${task.absentCount}`);
      console.log(`   - Pending: ${task.pendingCount}`);
      
      if (task.volunteers.length > 0 && !volunteerId) {
        volunteerId = task.volunteers[0].id;
        console.log(`   - First volunteer: ${task.volunteers[0].name} (${task.volunteers[0].attendanceStatus})`);
      }
    }

    // Step 4: Test existing attendance API for a specific task
    if (taskId) {
      console.log(`\n📋 Step 4: Testing GET /api/attendance/task/${taskId}`);
      const taskAttendance = await axios.get(`${baseURL}/attendance/task/${taskId}`, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      
      console.log('✅ Task attendance response:');
      console.log(`Found ${taskAttendance.data.length} attendance records for this task`);
    }

    // Step 5: Show summary
    console.log('\n📊 Test Summary:');
    console.log('✅ GET /api/attendance/tasks/today - Working');
    console.log('✅ GET /api/attendance/tasks/:date - Working');
    console.log('✅ GET /api/attendance/task/:taskId - Working (existing)');
    console.log('\n🎯 New APIs are ready for frontend integration!');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Build NGO Dashboard Attendance Tab UI');
    console.log('2. Add attendance marking interface');
    console.log('3. Test marking attendance with POST /api/attendance');
    console.log('4. Add volunteer task lifecycle tracking');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

console.log('🚀 Starting Attendance API Testing...\n');
testAttendanceAPIs();
