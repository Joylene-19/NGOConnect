import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testUpdateWithProperFormat() {
  console.log('🔧 Testing Update with Proper Frontend Data Format...\n');

  try {
    // Test NGO login
    console.log('1️⃣ Logging in as NGO...');
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

    // CREATE - Test creating a new task with frontend format
    console.log('2️⃣ Creating task with frontend data format...');
    const frontendTaskData = {
      title: 'Frontend Format Test Task',
      description: 'Testing task creation with frontend data format',
      location: 'Test City, CA',
      date: '2025-08-25',
      time: '14:30',
      duration: '6 hours',
      maxVolunteers: 8,
      category: 'Testing',
      urgency: 'high',
      requiredSkills: ['Testing', 'Frontend Development'],
      requirements: 'Frontend testing requirements'
    };

    // Transform frontend data to backend format (like the frontend does)
    const backendTaskData = {
      title: frontendTaskData.title,
      description: frontendTaskData.description,
      location: frontendTaskData.location,
      date: new Date(`${frontendTaskData.date}T${frontendTaskData.time}`),
      duration: frontendTaskData.duration,
      hours: parseInt(frontendTaskData.duration?.split(' ')[0]) || 4,
      maxVolunteers: frontendTaskData.maxVolunteers,
      category: frontendTaskData.category,
      urgency: frontendTaskData.urgency,
      requiredSkills: frontendTaskData.requiredSkills,
    };

    console.log('Transformed data:', JSON.stringify(backendTaskData, null, 2));

    const createResponse = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendTaskData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ CREATE failed:', error);
      throw new Error(`CREATE failed: ${createResponse.status}`);
    }

    const createdTask = await createResponse.json();
    console.log('✅ CREATE successful - Task ID:', createdTask.id);

    // UPDATE - Test updating with frontend format
    console.log('\n3️⃣ Updating task with frontend data format...');
    const frontendUpdateData = {
      title: 'UPDATED Frontend Format Test Task',
      description: 'UPDATED: Testing task update with frontend data format',
      location: 'Updated Test City, NY',
      date: '2025-08-27',
      time: '16:00',
      duration: '8 hours',
      maxVolunteers: 12,
      category: 'Development',
      urgency: 'medium',
      requiredSkills: ['Testing', 'Frontend Development', 'API Integration'],
      requirements: 'Updated frontend testing requirements'
    };

    // Transform frontend data to backend format
    const backendUpdateData = {
      title: frontendUpdateData.title,
      description: frontendUpdateData.description,
      location: frontendUpdateData.location,
      date: new Date(`${frontendUpdateData.date}T${frontendUpdateData.time}`),
      duration: frontendUpdateData.duration,
      hours: parseInt(frontendUpdateData.duration?.split(' ')[0]) || 4,
      maxVolunteers: frontendUpdateData.maxVolunteers,
      category: frontendUpdateData.category,
      urgency: frontendUpdateData.urgency,
      requiredSkills: frontendUpdateData.requiredSkills,
    };

    console.log('Update data:', JSON.stringify(backendUpdateData, null, 2));

    const updateResponse = await fetch(`${API_BASE}/api/tasks/${createdTask.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendUpdateData)
    });

    console.log('Update response status:', updateResponse.status);

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.log('❌ UPDATE failed:', error);
    } else {
      const updatedTask = await updateResponse.json();
      console.log('✅ UPDATE successful');
      console.log('   Updated title:', updatedTask.title);
      console.log('   Updated location:', updatedTask.location);
      console.log('   Updated urgency:', updatedTask.urgency);
    }

    // Verify UPDATE by reading
    console.log('\n4️⃣ Verifying update...');
    const verifyResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyResponse.ok) {
      const tasks = await verifyResponse.json();
      const updatedTask = tasks.find(t => t.id === createdTask.id);

      if (updatedTask) {
        console.log('✅ Update verified:');
        console.log('   Title:', updatedTask.title);
        console.log('   Location:', updatedTask.location);
        console.log('   Urgency:', updatedTask.urgency);
        console.log('   Category:', updatedTask.category);
        
        if (updatedTask.title.includes('UPDATED')) {
          console.log('🎉 UPDATE functionality working correctly!');
        } else {
          console.log('⚠️  Title not updated - possible issue');
        }
      } else {
        console.log('❌ Task not found during verification');
      }
    }

    // Clean up - delete the test task
    console.log('\n5️⃣ Cleaning up...');
    const deleteResponse = await fetch(`${API_BASE}/api/tasks/${createdTask.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Test task deleted successfully');
    }

    console.log('\n🎯 Frontend Format Update Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUpdateWithProperFormat();
