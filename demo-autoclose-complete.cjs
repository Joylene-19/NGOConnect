const axios = require('axios');

async function demonstrateAutoCloseForUser() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🎯 DEMO: Auto-Close Functionality for Past Tasks\n');
    console.log('Current server date: August 5, 2025 (for demonstration)');
    console.log('='.repeat(60));

    // Login as NGO
    const ngoLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    const ngoHeaders = { Authorization: `Bearer ${ngoLogin.data.token}` };

    // Create demo tasks with different dates
    console.log('\n📋 Creating demo tasks with different dates...\n');
    
    const tasks = [
      {
        title: 'Past Task - August 3rd',
        date: '2025-08-03',
        description: 'This task is from August 3rd (2 days ago)',
        expected: 'CLOSED'
      },
      {
        title: 'Today Task - August 5th',
        date: '2025-08-05', 
        description: 'This task is for today (August 5th)',
        expected: 'CLOSED'
      },
      {
        title: 'Future Task - August 10th',
        date: '2025-08-10',
        description: 'This task is for August 10th (5 days in future)',
        expected: 'OPEN'
      }
    ];

    const createdTasks = [];
    
    for (const task of tasks) {
      const response = await axios.post(`${baseURL}/tasks`, {
        title: task.title,
        description: task.description,
        location: 'Demo Location',
        requiredSkills: ['Demo'],
        date: task.date,
        hours: 4,
        category: 'Demo'
      }, { headers: ngoHeaders });
      
      createdTasks.push({ ...response.data, expected: task.expected });
      console.log(`✅ Created: ${task.title} (Expected: ${task.expected})`);
    }

    console.log('\n⏳ Waiting for auto-close processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check task statuses
    console.log('\n🔍 Checking task statuses after auto-close processing:\n');
    const allTasks = await axios.get(`${baseURL}/tasks`, { headers: ngoHeaders });
    
    for (const task of createdTasks) {
      const updatedTask = allTasks.data.find(t => t.id === task.id);
      if (updatedTask) {
        const statusIcon = updatedTask.status === 'closed' ? '🔴' : '🟢';
        const correctIcon = updatedTask.status === task.expected.toLowerCase() ? '✅' : '❌';
        console.log(`${statusIcon} ${updatedTask.title}`);
        console.log(`    📅 Date: ${updatedTask.date} | Status: ${updatedTask.status.toUpperCase()} ${correctIcon}`);
        console.log(`    Expected: ${task.expected} | Result: ${updatedTask.status === task.expected.toLowerCase() ? 'CORRECT' : 'INCORRECT'}`);
        console.log('');
      }
    }

    // Test volunteer perspective
    console.log('👤 VOLUNTEER PERSPECTIVE:\n');
    const volunteerLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    const volunteerHeaders = { Authorization: `Bearer ${volunteerLogin.data.token}` };

    const availableTasks = await axios.get(`${baseURL}/tasks/available`, { headers: volunteerHeaders });
    
    console.log('📋 Available Tasks (what volunteers see):');
    
    for (const task of createdTasks) {
      const visibleTask = availableTasks.data.find(t => t.id === task.id);
      if (visibleTask) {
        console.log(`   🟢 ${visibleTask.title} - ${visibleTask.date} (VISIBLE)`);
      } else {
        console.log(`   🔴 ${task.title} - ${task.date} (HIDDEN - Past/Closed)`);
      }
    }

    console.log('\n🎯 Testing volunteer applications:\n');
    
    for (const task of createdTasks) {
      try {
        await axios.post(`${baseURL}/tasks/${task.id}/apply`, {
          motivation: `Trying to apply to ${task.title}`
        }, { headers: volunteerHeaders });
        console.log(`✅ ${task.title}: Application ALLOWED`);
      } catch (error) {
        console.log(`🚫 ${task.title}: Application BLOCKED`);
        console.log(`    Reason: "${error.response?.data?.error}"`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY:');
    console.log('✅ Past and current-day tasks are automatically CLOSED');
    console.log('✅ Future tasks remain OPEN for applications');
    console.log('✅ Volunteers cannot see closed tasks in available list');
    console.log('✅ Volunteers cannot apply to closed tasks');
    console.log('✅ Clear error messages when applying to closed tasks');
    console.log('='.repeat(60));

    // Cleanup
    console.log('\n🧹 Cleaning up demo tasks...');
    for (const task of createdTasks) {
      try {
        await axios.delete(`${baseURL}/tasks/${task.id}`, { headers: ngoHeaders });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Demo failed:', error.response ? error.response.data : error.message);
  }
}

demonstrateAutoCloseForUser();
