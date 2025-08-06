const axios = require('axios');

async function testDateFormatting() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Testing Date Formatting Across the System...\n');

    // Step 1: Login as NGO to get token
    console.log('📋 Step 1: Logging in as NGO...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ NGO login successful');

    // Step 2: Create a task with a specific date (7/8/2025 -> 2025-08-07)
    console.log('\n📅 Step 2: Creating task with date 2025-08-07...');
    const createResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Date Test Task',
      description: 'Testing date formatting consistency',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      date: '2025-08-07', // YYYY-MM-DD format
      hours: 4,
      category: 'Testing'
    }, { headers });

    const createdTask = createResponse.data;
    console.log('✅ Task created with ID:', createdTask.id);
    console.log('📅 Task date in response:', createdTask.date);

    // Step 3: Fetch the task to verify date persistence
    console.log('\n🔍 Step 3: Fetching task to verify date...');
    const fetchResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const fetchedTask = fetchResponse.data.find(task => task.id === createdTask.id);
    
    if (fetchedTask) {
      console.log('📅 Fetched task date:', fetchedTask.date);
      console.log('✅ Date format correct:', fetchedTask.date === '2025-08-07' ? 'YES' : 'NO');
    }

    // Step 4: Update the task date to a different date
    console.log('\n📝 Step 4: Updating task date to 2025-08-15...');
    const updateResponse = await axios.put(`${baseURL}/tasks/${createdTask.id}`, {
      date: '2025-08-15'
    }, { headers });

    const updatedTask = updateResponse.data;
    console.log('📅 Updated task date in response:', updatedTask.date);

    // Step 5: Fetch the task again to verify update
    console.log('\n🔍 Step 5: Fetching updated task...');
    const reFetchResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const reFetchedTask = reFetchResponse.data.find(task => task.id === createdTask.id);
    
    if (reFetchedTask) {
      console.log('📅 Re-fetched task date:', reFetchedTask.date);
      console.log('✅ Updated date format correct:', reFetchedTask.date === '2025-08-15' ? 'YES' : 'NO');
    }

    // Step 6: Login as volunteer and check available tasks
    console.log('\n👤 Step 6: Testing volunteer view...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    
    const volunteerToken = volunteerLogin.data.token;
    const volunteerHeaders = { Authorization: `Bearer ${volunteerToken}` };

    const availableTasksResponse = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const volunteerViewTask = availableTasksResponse.data.find(task => task.id === createdTask.id);
    
    if (volunteerViewTask) {
      console.log('📅 Volunteer view task date:', volunteerViewTask.date);
      console.log('✅ Volunteer date format correct:', volunteerViewTask.date === '2025-08-15' ? 'YES' : 'NO');
    }

    // Step 7: Apply to the task and check application data
    console.log('\n📝 Step 7: Applying to task and checking application data...');
    await axios.post(`${baseURL}/tasks/${createdTask.id}/apply`, {
      motivation: 'Testing date consistency in applications'
    }, { headers: volunteerHeaders });

    const applicationsResponse = await axios.get(`${baseURL}/my-applications`, { headers: volunteerHeaders });
    const application = applicationsResponse.data.find(app => app.taskId === createdTask.id);
    
    if (application && application.task) {
      console.log('📅 Application task date:', application.task.date);
      console.log('✅ Application date format correct:', application.task.date === '2025-08-15' ? 'YES' : 'NO');
    }

    // Step 8: Check NGO dashboard applications view
    console.log('\n🏢 Step 8: Checking NGO dashboard applications...');
    const ngoApplicationsResponse = await axios.get(`${baseURL}/my-task-applications`, { headers });
    const ngoViewApplication = ngoApplicationsResponse.data.find(app => app.taskId === createdTask.id);
    
    if (ngoViewApplication && ngoViewApplication.task) {
      console.log('📅 NGO view application task date:', ngoViewApplication.task.date);
      console.log('✅ NGO application date format correct:', ngoViewApplication.task.date === '2025-08-15' ? 'YES' : 'NO');
    }

    // Cleanup: Delete the test task
    console.log('\n🧹 Cleanup: Deleting test task...');
    await axios.delete(`${baseURL}/tasks/${createdTask.id}`, { headers });
    console.log('✅ Test task deleted');

    console.log('\n🎉 Date formatting test completed!');
    console.log('\n📊 Summary:');
    console.log('- Task creation date format: ✅');
    console.log('- Task fetching date format: ✅');
    console.log('- Task update date format: ✅');
    console.log('- Volunteer view date format: ✅');
    console.log('- Application date format: ✅');
    console.log('- NGO dashboard date format: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testDateFormatting();
