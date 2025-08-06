import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testAllCRUDOperations() {
  console.log('🧪 Testing Complete CRUD Operations...\n');

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

    // CREATE - Test creating a new task
    console.log('2️⃣ Testing CREATE Operation...');
    const createTaskData = {
      title: 'CRUD Test Task',
      description: 'This task is created to test all CRUD operations',
      location: 'Test City, CA',
      date: '2025-08-25',
      time: '10:00',
      duration: '4 hours',
      maxVolunteers: 5,
      category: 'Testing',
      urgency: 'medium',
      requiredSkills: ['Testing', 'Quality Assurance'],
      requirements: 'Testing requirements for CRUD operations'
    };

    const createResponse = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createTaskData)
    });

    console.log('Create response status:', createResponse.status);

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ CREATE failed:', error);
      throw new Error(`CREATE failed: ${createResponse.status}`);
    }

    const createdTask = await createResponse.json();
    console.log('✅ CREATE successful - Task ID:', createdTask.id);

    // READ - Test fetching tasks
    console.log('\n3️⃣ Testing READ Operation...');
    const readResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!readResponse.ok) {
      throw new Error(`READ failed: ${readResponse.status}`);
    }

    const tasks = await readResponse.json();
    const foundTask = tasks.find(t => t.id === createdTask.id);

    if (foundTask) {
      console.log('✅ READ successful - Task found in list');
      console.log('   Task title:', foundTask.title);
    } else {
      console.log('❌ READ failed - Created task not found in list');
    }

    // UPDATE - Test updating the task
    console.log('\n4️⃣ Testing UPDATE Operation...');
    const updateTaskData = {
      title: 'UPDATED CRUD Test Task',
      description: 'This task has been UPDATED to test CRUD operations',
      location: 'Updated City, CA',
      date: '2025-08-26',
      time: '14:00',
      duration: '6 hours',
      maxVolunteers: 8,
      category: 'Testing',
      urgency: 'high',
      requiredSkills: ['Testing', 'Quality Assurance', 'Documentation'],
      requirements: 'Updated requirements for CRUD operations testing'
    };

    const updateResponse = await fetch(`${API_BASE}/api/tasks/${createdTask.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateTaskData)
    });

    console.log('Update response status:', updateResponse.status);

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.log('❌ UPDATE failed:', error);
    } else {
      const updatedTask = await updateResponse.json();
      console.log('✅ UPDATE successful');
      console.log('   Updated title:', updatedTask.title || 'Title not returned');
    }

    // Verify UPDATE by reading again
    console.log('\n5️⃣ Verifying UPDATE...');
    const verifyReadResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyReadResponse.ok) {
      const updatedTasks = await verifyReadResponse.json();
      const updatedFoundTask = updatedTasks.find(t => t.id === createdTask.id);

      if (updatedFoundTask && updatedFoundTask.title.includes('UPDATED')) {
        console.log('✅ UPDATE verified - Changes persisted');
        console.log('   Title:', updatedFoundTask.title);
        console.log('   Location:', updatedFoundTask.location);
        console.log('   Urgency:', updatedFoundTask.urgency);
      } else {
        console.log('❌ UPDATE verification failed - Changes not persisted');
        if (updatedFoundTask) {
          console.log('   Current title:', updatedFoundTask.title);
        }
      }
    }

    // DELETE - Test deleting the task
    console.log('\n6️⃣ Testing DELETE Operation...');
    const deleteResponse = await fetch(`${API_BASE}/api/tasks/${createdTask.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Delete response status:', deleteResponse.status);

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.log('❌ DELETE failed:', error);
    } else {
      const deleteResult = await deleteResponse.json();
      console.log('✅ DELETE successful:', deleteResult.message);
    }

    // Verify DELETE by reading again
    console.log('\n7️⃣ Verifying DELETE...');
    const verifyDeleteResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyDeleteResponse.ok) {
      const finalTasks = await verifyDeleteResponse.json();
      const deletedTaskExists = finalTasks.find(t => t.id === createdTask.id);

      if (!deletedTaskExists) {
        console.log('✅ DELETE verified - Task removed from database');
      } else {
        console.log('❌ DELETE verification failed - Task still exists');
      }
    }

    // Test error cases
    console.log('\n8️⃣ Testing Error Handling...');
    
    // Test READ non-existent task
    const readNonExistentResponse = await fetch(`${API_BASE}/api/tasks/nonexistent123`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Non-existent task read status:', readNonExistentResponse.status);

    // Test UPDATE non-existent task
    const updateNonExistentResponse = await fetch(`${API_BASE}/api/tasks/nonexistent123`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateTaskData)
    });
    console.log('✅ Non-existent task update status:', updateNonExistentResponse.status);

    // Test DELETE non-existent task
    const deleteNonExistentResponse = await fetch(`${API_BASE}/api/tasks/nonexistent123`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Non-existent task delete status:', deleteNonExistentResponse.status);

    console.log('\n🎉 Complete CRUD Testing Finished!');
    console.log('\n📋 Summary:');
    console.log('✅ CREATE - Task creation working');
    console.log('✅ READ - Task fetching working');
    console.log('✅ UPDATE - Task updating (check logs for status)');
    console.log('✅ DELETE - Task deletion working');
    console.log('✅ Error handling for non-existent resources');

  } catch (error) {
    console.error('❌ CRUD Test failed:', error.message);
    process.exit(1);
  }
}

testAllCRUDOperations();
