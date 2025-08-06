const axios = require('axios');

async function testOriginalIssue() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🎯 Testing Original Issue Resolution...\n');
    console.log('User Issue: "now i created a task for 7/8/2025 but in the volunteer dashboard it should 2025-08-06"');
    console.log('Expected: Task created for 7/8/2025 should show as 2025-08-07 everywhere\n');

    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Create task for 7/8/2025 (which is August 7, 2025)
    console.log('📋 Creating task for 7/8/2025 (August 7, 2025)...');
    const createResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Community Garden Project',
      description: 'Help us plant vegetables in the community garden',
      location: 'Downtown Community Center',
      requiredSkills: ['Gardening', 'Teamwork'],
      date: '2025-08-07', // 7/8/2025 in YYYY-MM-DD format
      hours: 6,
      category: 'Community'
    }, { headers });

    const taskId = createResponse.data.id;
    console.log('✅ Task created with ID:', taskId);
    console.log('📅 NGO sees date as:', createResponse.data.date);

    // Check all the different views to ensure consistency:

    // 1. NGO Dashboard (GET /api/tasks)
    console.log('\n🏢 1. NGO Dashboard View...');
    const ngoTasksResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const ngoTask = ngoTasksResponse.data.find(t => t.id === taskId);
    console.log('📅 NGO dashboard shows:', ngoTask.date);

    // 2. Volunteer Dashboard (GET /api/tasks/available)
    console.log('\n👤 2. Volunteer Dashboard View...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };
    
    const availableTasksResponse = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const volunteerTask = availableTasksResponse.data.find(t => t.id === taskId);
    console.log('📅 Volunteer dashboard shows:', volunteerTask.date);

    // 3. Test editing the date from NGO dashboard
    console.log('\n✏️  3. Testing Date Edit from NGO Dashboard...');
    const newDate = '2025-08-20';
    console.log('Changing date to:', newDate);
    
    const updateResponse = await axios.put(`${baseURL}/tasks/${taskId}`, {
      date: newDate
    }, { headers });
    console.log('📅 After edit, API returns:', updateResponse.data.date);

    // Verify the edit worked in all views
    const updatedNgoTasks = await axios.get(`${baseURL}/tasks`, { headers });
    const updatedNgoTask = updatedNgoTasks.data.find(t => t.id === taskId);
    console.log('📅 NGO dashboard now shows:', updatedNgoTask.date);

    const updatedVolunteerTasks = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    const updatedVolunteerTask = updatedVolunteerTasks.data.find(t => t.id === taskId);
    console.log('📅 Volunteer dashboard now shows:', updatedVolunteerTask.date);

    // 4. Test application flow to ensure date consistency
    console.log('\n📝 4. Testing Application Flow...');
    await axios.post(`${baseURL}/tasks/${taskId}/apply`, {
      motivation: 'I love gardening and want to help the community!'
    }, { headers: volunteerHeaders });

    const volunteerApplications = await axios.get(`${baseURL}/my-applications`, { headers: volunteerHeaders });
    const application = volunteerApplications.data.find(app => app.taskId === taskId);
    console.log('📅 Volunteer application shows task date:', application.task.date);

    const ngoApplications = await axios.get(`${baseURL}/my-task-applications`, { headers });
    const ngoApplication = ngoApplications.data.find(app => app.taskId === taskId);
    console.log('📅 NGO application view shows task date:', ngoApplication.task.date);

    // Summary
    console.log('\n📊 RESULTS SUMMARY:');
    console.log('=====================================');
    const expectedDate = '2025-08-20'; // After our edit
    console.log('Expected date everywhere:', expectedDate);
    console.log('NGO dashboard:', updatedNgoTask.date === expectedDate ? '✅ CORRECT' : '❌ WRONG');
    console.log('Volunteer dashboard:', updatedVolunteerTask.date === expectedDate ? '✅ CORRECT' : '❌ WRONG');
    console.log('Volunteer application:', application.task.date === expectedDate ? '✅ CORRECT' : '❌ WRONG');
    console.log('NGO application view:', ngoApplication.task.date === expectedDate ? '✅ CORRECT' : '❌ WRONG');
    console.log('Date editing functionality:', updateResponse.data.date === expectedDate ? '✅ WORKING' : '❌ BROKEN');

    const allCorrect = [
      updatedNgoTask.date === expectedDate,
      updatedVolunteerTask.date === expectedDate,
      application.task.date === expectedDate,
      ngoApplication.task.date === expectedDate,
      updateResponse.data.date === expectedDate
    ].every(Boolean);

    console.log('\n🎯 ORIGINAL ISSUE STATUS:', allCorrect ? '✅ RESOLVED' : '❌ NOT RESOLVED');

    if (allCorrect) {
      console.log('\n🎉 SUCCESS! All date formatting issues have been fixed:');
      console.log('- Dates are consistent across all views');
      console.log('- Date editing works from NGO dashboard');
      console.log('- No more timezone conversion issues');
      console.log('- One standard format (YYYY-MM-DD) used throughout');
    }

    // Clean up
    await axios.delete(`${baseURL}/tasks/${taskId}`, { headers });
    console.log('\n🧹 Test task cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testOriginalIssue();
