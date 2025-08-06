const axios = require('axios');

async function comprehensiveAutoCloseTest() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🧪 Comprehensive Auto-Close Functionality Test\n');

    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('📋 Creating test tasks with different dates...');
    
    // Create past task (should auto-close)
    const pastTask = await axios.post(`${baseURL}/tasks`, {
      title: 'Past Task (Should Auto-Close)',
      description: 'This task is from August 1st',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      date: '2025-08-01',
      hours: 4,
      category: 'Testing'
    }, { headers });

    // Create current/future task (should stay open)
    const futureTask = await axios.post(`${baseURL}/tasks`, {
      title: 'Future Task (Should Stay Open)',
      description: 'This task is for August 15th',
      location: 'Test Location',
      requiredSkills: ['Testing'],
      date: '2025-08-15',
      hours: 4,
      category: 'Testing'
    }, { headers });

    console.log('✅ Tasks created:');
    console.log(`   Past Task ID: ${pastTask.data.id}`);
    console.log(`   Future Task ID: ${futureTask.data.id}`);

    // Wait and fetch tasks to trigger auto-close
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🔍 Fetching all tasks to trigger auto-close...');
    const allTasks = await axios.get(`${baseURL}/tasks`, { headers });
    
    const updatedPastTask = allTasks.data.find(t => t.id === pastTask.data.id);
    const updatedFutureTask = allTasks.data.find(t => t.id === futureTask.data.id);

    console.log('\n📊 Task Status Check:');
    console.log(`   Past Task Status: ${updatedPastTask ? updatedPastTask.status : 'NOT FOUND'} ${updatedPastTask?.status === 'closed' ? '✅' : '❌'}`);
    console.log(`   Future Task Status: ${updatedFutureTask ? updatedFutureTask.status : 'NOT FOUND'} ${updatedFutureTask?.status === 'open' ? '✅' : '❌'}`);

    // Test volunteer login
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };

    console.log('\n👤 Testing Volunteer Applications:');
    
    // Try to apply to past task (should be blocked)
    try {
      await axios.post(`${baseURL}/tasks/${pastTask.data.id}/apply`, {
        motivation: 'I want to help with this task'
      }, { headers: volunteerHeaders });
      console.log('   Past Task Application: ❌ SHOULD HAVE BEEN BLOCKED');
    } catch (error) {
      console.log('   Past Task Application: ✅ CORRECTLY BLOCKED');
      console.log(`     Error: ${error.response?.data?.error || error.message}`);
    }

    // Try to apply to future task (should work)
    try {
      const futureApplication = await axios.post(`${baseURL}/tasks/${futureTask.data.id}/apply`, {
        motivation: 'I want to help with this future task'
      }, { headers: volunteerHeaders });
      console.log('   Future Task Application: ✅ SUCCESSFULLY APPLIED');
    } catch (error) {
      console.log('   Future Task Application: ❌ SHOULD HAVE WORKED');
      console.log(`     Error: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n👁️ Testing Available Tasks Filtering:');
    const availableTasks = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    
    const pastTaskVisible = availableTasks.data.find(t => t.id === pastTask.data.id);
    const futureTaskVisible = availableTasks.data.find(t => t.id === futureTask.data.id);

    console.log(`   Past Task in Available List: ${pastTaskVisible ? '❌ VISIBLE (WRONG)' : '✅ HIDDEN (CORRECT)'}`);
    console.log(`   Future Task in Available List: ${futureTaskVisible ? '✅ VISIBLE (CORRECT)' : '❌ HIDDEN (WRONG)'}`);

    console.log('\n📈 Summary:');
    const pastTaskCheck = updatedPastTask?.status === 'closed';
    const futureTaskCheck = updatedFutureTask?.status === 'open';
    const availabilityCheck = !pastTaskVisible && futureTaskVisible;
    
    if (pastTaskCheck && futureTaskCheck && availabilityCheck) {
      console.log('🎉 ALL TESTS PASSED! Auto-close functionality is working perfectly!');
    } else {
      console.log('⚠️  Some tests failed. Auto-close needs debugging.');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test tasks...');
    try {
      await axios.delete(`${baseURL}/tasks/${pastTask.data.id}`, { headers });
      console.log('   Past task cleaned up');
    } catch (e) {
      console.log('   Past task already deleted or not found');
    }
    
    try {
      await axios.delete(`${baseURL}/tasks/${futureTask.data.id}`, { headers });
      console.log('   Future task cleaned up');
    } catch (e) {
      console.log('   Future task cleanup failed:', e.response?.data || e.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

comprehensiveAutoCloseTest();
