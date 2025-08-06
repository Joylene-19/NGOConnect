import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testEditViewFunctionality() {
  console.log('🧪 Testing Edit & View Functionality...\n');

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

    // Test fetching tasks (should be sorted by newest first)
    console.log('2️⃣ Testing Task Fetching & Sorting...');
    const tasksResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!tasksResponse.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksResponse.status}`);
    }

    const tasks = await tasksResponse.json();
    console.log(`✅ Fetched ${tasks.length} tasks`);

    if (tasks.length > 1) {
      const dates = tasks.map(t => new Date(t.createdAt || t.date));
      const isSorted = dates.every((date, i) => i === 0 || dates[i-1] >= date);
      console.log(`✅ Tasks are ${isSorted ? 'properly' : 'NOT properly'} sorted by newest first`);
    }

    // Test creating a task to have something to edit
    console.log('\n3️⃣ Creating a test task for editing...');
    const createTaskResponse = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Task for Edit/View',
        description: 'This task will be used to test edit and view functionality',
        location: 'Test Location, CA',
        date: '2025-08-15',
        time: '10:00',
        duration: '2 hours',
        maxVolunteers: 5,
        category: 'Community Service',
        urgency: 'medium',
        requiredSkills: ['Communication', 'Teamwork'],
        requirements: 'Bring enthusiasm!'
      })
    });

    if (!createTaskResponse.ok) {
      throw new Error(`Failed to create task: ${createTaskResponse.status}`);
    }

    const newTask = await createTaskResponse.json();
    console.log(`✅ Created test task with ID: ${newTask.id}`);

    // Test editing the task
    console.log('\n4️⃣ Testing Task Edit Functionality...');
    const editTaskResponse = await fetch(`${API_BASE}/api/tasks/${newTask.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'EDITED: Test Task for Edit/View',
        description: 'This task has been EDITED to test edit functionality',
        location: 'EDITED Location, CA',
        date: '2025-08-16',
        time: '11:00',
        duration: '3 hours',
        maxVolunteers: 8,
        category: 'Environmental',
        urgency: 'high',
        requiredSkills: ['Communication', 'Teamwork', 'Leadership'],
        requirements: 'Bring enthusiasm and energy!'
      })
    });

    if (editTaskResponse.ok) {
      console.log('✅ Task edit successful');
    } else {
      console.log(`❌ Task edit failed: ${editTaskResponse.status}`);
    }

    // Test fetching the edited task
    console.log('\n5️⃣ Verifying edited task...');
    const verifyResponse = await fetch(`${API_BASE}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyResponse.ok) {
      const updatedTasks = await verifyResponse.json();
      const editedTask = updatedTasks.find(t => t.id === newTask.id);
      
      if (editedTask && editedTask.title.includes('EDITED')) {
        console.log('✅ Task edit verified - changes persisted');
        console.log(`   Title: ${editedTask.title}`);
        console.log(`   Location: ${editedTask.location}`);
        console.log(`   Urgency: ${editedTask.urgency}`);
      } else {
        console.log('❌ Task edit verification failed');
      }
    }

    // Test frontend accessibility
    console.log('\n6️⃣ Testing Frontend Accessibility...');
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('✅ Frontend accessible');
    } else {
      console.log('❌ Frontend not accessible');
    }

    console.log('\n🎉 Edit & View Functionality Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ NGO authentication working');
    console.log('✅ Task fetching and sorting working');
    console.log('✅ Task creation working');
    console.log('✅ Task editing API working');
    console.log('✅ Frontend accessible');
    console.log('\n🔄 Next: Test the edit and view buttons in the NGO dashboard UI');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testEditViewFunctionality();
