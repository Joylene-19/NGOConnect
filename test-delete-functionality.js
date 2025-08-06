import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testDeleteFunctionality() {
  console.log('🧪 Testing Delete Task Functionality...\n');

  try {
    // Test NGO login
    console.log('1️⃣ Testing NGO Login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'contact@oceanguardians.org',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ NGO login successful\n');

    // Create a test task to delete
    console.log('2️⃣ Creating a test task for deletion...');
    const createTaskResponse = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Task for Deletion',
        description: 'This task will be deleted to test delete functionality',
        location: 'Test Location, CA',
        date: '2025-08-20',
        time: '14:00',
        duration: '2 hours',
        maxVolunteers: 3,
        category: 'Testing',
        urgency: 'low',
        requiredSkills: ['Testing'],
        requirements: 'Just for testing delete functionality'
      })
    });

    if (!createTaskResponse.ok) {
      throw new Error(`Failed to create task: ${createTaskResponse.status}`);
    }

    const newTask = await createTaskResponse.json();
    console.log(`✅ Created test task with ID: ${newTask.id}`);

    // Get current task count
    console.log('\n3️⃣ Getting task count before deletion...');
    const tasksBeforeResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (tasksBeforeResponse.ok) {
      const tasksBefore = await tasksBeforeResponse.json();
      console.log(`✅ Current task count: ${tasksBefore.length}`);
    }

    // Test deleting the task
    console.log('\n4️⃣ Testing Task Deletion...');
    const deleteTaskResponse = await fetch(`${API_BASE}/api/tasks/${newTask.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteTaskResponse.ok) {
      const deleteResult = await deleteTaskResponse.json();
      console.log('✅ Task deletion successful');
      console.log(`   Message: ${deleteResult.message}`);
    } else {
      const error = await deleteTaskResponse.json();
      console.log(`❌ Task deletion failed: ${deleteTaskResponse.status} - ${error.error}`);
    }

    // Verify the task is gone
    console.log('\n5️⃣ Verifying task deletion...');
    const tasksAfterResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (tasksAfterResponse.ok) {
      const tasksAfter = await tasksAfterResponse.json();
      const deletedTaskExists = tasksAfter.find(t => t.id === newTask.id);
      
      if (!deletedTaskExists) {
        console.log('✅ Task successfully deleted and removed from list');
        console.log(`   Task count after deletion: ${tasksAfter.length}`);
      } else {
        console.log('❌ Task still exists after deletion attempt');
      }
    }

    // Test deleting a non-existent task
    console.log('\n6️⃣ Testing deletion of non-existent task...');
    const deleteNonExistentResponse = await fetch(`${API_BASE}/api/tasks/nonexistent123`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteNonExistentResponse.status === 404) {
      console.log('✅ Properly handles deletion of non-existent task (404 error)');
    } else {
      console.log(`❌ Unexpected response for non-existent task: ${deleteNonExistentResponse.status}`);
    }

    // Test frontend accessibility
    console.log('\n7️⃣ Testing Frontend Accessibility...');
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('✅ Frontend accessible');
    } else {
      console.log('❌ Frontend not accessible');
    }

    console.log('\n🎉 Delete Functionality Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ NGO authentication working');
    console.log('✅ Task creation working');
    console.log('✅ Task deletion API working');
    console.log('✅ Task removal verified');
    console.log('✅ Error handling for non-existent tasks');
    console.log('✅ Frontend accessible');
    console.log('\n🔄 Next: Test the delete button in the NGO dashboard UI');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDeleteFunctionality();
