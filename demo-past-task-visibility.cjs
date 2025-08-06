const axios = require('axios');

async function demoPastTaskVisibility() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🎭 Demo: How Past Tasks Appear to Volunteers\n');

    // Login as NGO to create a past task
    console.log('🏢 Logging in as NGO...');
    const ngoLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const ngoHeaders = { Authorization: `Bearer ${ngoLogin.data.token}` };

    // Create a task for August 5th (past date)
    console.log('📋 Creating task for August 5th, 2025 (past date)...');
    const pastTask = await axios.post(`${baseURL}/tasks`, {
      title: 'Beach Cleanup Demo - August 5th',
      description: 'This was a beach cleanup event scheduled for August 5th, 2025. Since the date has passed, volunteers should not be able to apply.',
      location: 'Santa Monica Beach',
      requiredSkills: ['Environmental Work', 'Physical Activity'],
      date: '2025-08-05', // Past date
      hours: 6,
      category: 'Environment'
    }, { headers: ngoHeaders });

    console.log(`✅ Task created with ID: ${pastTask.data.id}`);
    console.log(`📅 Task date: ${pastTask.data.date}`);
    console.log(`📊 Initial status: ${pastTask.data.status}\n`);

    // Login as volunteer
    console.log('👤 Logging in as volunteer (Sarah Johnson)...');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };

    // Check available tasks (this will trigger auto-close)
    console.log('🔍 Volunteer checking available tasks...');
    const availableTasks = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    
    const pastTaskInAvailable = availableTasks.data.find(t => t.id === pastTask.data.id);
    
    console.log('📊 Available Tasks Results:');
    console.log(`   Total available tasks: ${availableTasks.data.length}`);
    console.log(`   Past task visible: ${pastTaskInAvailable ? 'YES ❌' : 'NO ✅'}`);
    
    if (!pastTaskInAvailable) {
      console.log('   ✅ Correct! Past task is hidden from available tasks list');
    }

    // Check all tasks from NGO perspective (this will show the status)
    console.log('\n🏢 NGO checking all their tasks...');
    const allTasks = await axios.get(`${baseURL}/tasks`, { headers: ngoHeaders });
    const pastTaskFromNGO = allTasks.data.find(t => t.id === pastTask.data.id);
    
    console.log('📊 NGO Task View Results:');
    if (pastTaskFromNGO) {
      console.log(`   Task status: ${pastTaskFromNGO.status}`);
      console.log(`   Task status display: ${pastTaskFromNGO.taskStatus || 'Not set'}`);
      console.log(`   Date: ${pastTaskFromNGO.date}`);
      console.log(`   ${pastTaskFromNGO.status === 'closed' ? '✅' : '❌'} Status correctly shows as closed`);
    }

    // Try volunteer application (should be blocked)
    console.log('\n👤 Volunteer attempting to apply to past task...');
    try {
      const application = await axios.post(`${baseURL}/tasks/${pastTask.data.id}/apply`, {
        motivation: 'I would like to help with this beach cleanup'
      }, { headers: volunteerHeaders });
      console.log('❌ ERROR: Application should have been blocked!');
      console.log('Response:', application.data);
    } catch (error) {
      console.log('✅ Application correctly blocked!');
      console.log(`   Error message: "${error.response?.data?.error}"`);
      console.log('   This is the message volunteers see when trying to apply to past tasks');
    }

    // Show volunteer what they see in the UI
    console.log('\n🖥️  What Volunteer Sees in the UI:');
    console.log('   ┌─────────────────────────────────────┐');
    console.log('   │        Available Tasks             │');
    console.log('   ├─────────────────────────────────────┤');
    availableTasks.data.slice(0, 3).forEach((task, index) => {
      const statusIcon = task.status === 'open' ? '🟢' : '🔴';
      console.log(`   │ ${statusIcon} ${task.title.substring(0, 25).padEnd(25)} │`);
      console.log(`   │    📅 ${task.date} | 📍 ${task.location.substring(0, 15)} │`);
      console.log('   ├─────────────────────────────────────┤');
    });
    console.log('   └─────────────────────────────────────┘');
    console.log('   📝 Note: Past tasks are automatically filtered out');

    console.log('\n🏢 What NGO Sees in Dashboard:');
    console.log('   ┌─────────────────────────────────────────────┐');
    console.log('   │             My Tasks                       │');
    console.log('   ├─────────────────────────────────────────────┤');
    allTasks.data.filter(t => t.title.includes('Demo')).forEach(task => {
      const statusIcon = task.status === 'closed' ? '🔴' : '🟢';
      const statusText = task.status === 'closed' ? 'CLOSED' : 'OPEN';
      console.log(`   │ ${statusIcon} ${task.title.substring(0, 30).padEnd(30)} │`);
      console.log(`   │    📅 ${task.date} | Status: ${statusText.padEnd(8)} │`);
      console.log('   ├─────────────────────────────────────────────┤');
    });
    console.log('   └─────────────────────────────────────────────┘');

    console.log('\n📋 Summary:');
    console.log('✅ Past tasks are automatically marked as CLOSED');
    console.log('✅ Volunteers cannot see past tasks in available list');
    console.log('✅ Volunteers cannot apply to past tasks');
    console.log('✅ NGOs can still see past tasks but with CLOSED status');
    console.log('✅ Clear error message when volunteers try to apply to closed tasks');

    // Cleanup
    console.log('\n🧹 Cleaning up demo task...');
    await axios.delete(`${baseURL}/tasks/${pastTask.data.id}`, { headers: ngoHeaders });
    console.log('✅ Demo task cleaned up');

  } catch (error) {
    console.error('❌ Demo failed:', error.response ? error.response.data : error.message);
  }
}

demoPastTaskVisibility();
