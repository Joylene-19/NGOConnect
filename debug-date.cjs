const axios = require('axios');

async function debugDateIssue() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🐛 Debugging Date Issue...\n');

    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org', 
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Creating task with date string: "2025-08-07"');
    
    // Create task and log what we get back
    const createResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'Debug Date Task',
      description: 'Debugging date conversion',
      location: 'Debug Location', 
      requiredSkills: ['Debugging'],
      date: '2025-08-07', // This should be stored as 2025-08-07
      hours: 4,
      category: 'Debug'
    }, { headers });

    const task = createResponse.data;
    console.log('Response from task creation:');
    console.log('- task.date:', task.date);
    console.log('- typeof task.date:', typeof task.date);

    // Now let's fetch all tasks and see what we get
    const fetchResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const fetchedTask = fetchResponse.data.find(t => t.id === task.id);
    
    console.log('\nFetched task:');
    console.log('- fetchedTask.date:', fetchedTask.date);
    console.log('- typeof fetchedTask.date:', typeof fetchedTask.date);

    // Update the task date and see what happens
    console.log('\nUpdating task date to "2025-08-15"...');
    const updateResponse = await axios.put(`${baseURL}/tasks/${task.id}`, {
      date: '2025-08-15'
    }, { headers });

    console.log('Update response:');
    console.log('- updatedTask.date:', updateResponse.data.date);

    // Fetch again
    const refetchResponse = await axios.get(`${baseURL}/tasks`, { headers });
    const refetchedTask = refetchResponse.data.find(t => t.id === task.id);
    
    console.log('\nRe-fetched task after update:');
    console.log('- refetchedTask.date:', refetchedTask.date);

    // Clean up
    await axios.delete(`${baseURL}/tasks/${task.id}`, { headers });
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

debugDateIssue();
