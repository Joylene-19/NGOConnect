const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

async function debugDateWithDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const TaskModel = mongoose.model('Task', new mongoose.Schema({
      title: String,
      date: Date,
    }));

    const baseURL = 'http://localhost:3001/api';
    
    // Login as NGO
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'contact@oceanguardians.org', 
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Creating task with date: "2025-08-07"');
    
    // Create task
    const createResponse = await axios.post(`${baseURL}/tasks`, {
      title: 'DB Debug Date Task',
      description: 'Debugging date conversion',
      location: 'Debug Location', 
      requiredSkills: ['Debugging'],
      date: '2025-08-07',
      hours: 4,
      category: 'Debug'
    }, { headers });

    const task = createResponse.data;
    console.log('API Response date:', task.date);

    // Check what's stored in DB
    const dbTask = await TaskModel.findOne({ title: 'DB Debug Date Task' });
    if (dbTask) {
      console.log('\nStored in MongoDB:');
      console.log('- Raw date:', dbTask.date);
      console.log('- toISOString():', dbTask.date.toISOString());
      console.log('- getFullYear():', dbTask.date.getFullYear());
      console.log('- getMonth():', dbTask.date.getMonth() + 1); // Add 1 since month is 0-indexed
      console.log('- getDate():', dbTask.date.getDate());
      
      // Test our formatDateToISO function
      const year = dbTask.date.getFullYear();
      const month = String(dbTask.date.getMonth() + 1).padStart(2, '0');
      const day = String(dbTask.date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      console.log('- formatDateToISO result:', formatted);
    }

    // Clean up
    await axios.delete(`${baseURL}/tasks/${task.id}`, { headers });
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

debugDateWithDB();
