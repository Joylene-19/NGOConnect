const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugJoyleneCertificate() {
  console.log('🔍 DEBUGGING JOYLENE CERTIFICATE GENERATION');
  
  try {
    // Step 1: Login as NGO
    const ngoLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    const ngoToken = ngoLogin.data.token;
    
    // Step 2: Login as Joylene
    const joylenLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'joylene19072005@gmail.com',
      password: 'joylene19072005'
    });
    const joylenToken = joylenLogin.data.token;
    
    console.log('👤 Joylene User Info:');
    console.log(`   ID: ${joylenLogin.data.user.id}`);
    console.log(`   Username: ${joylenLogin.data.user.username}`);
    console.log(`   Email: ${joylenLogin.data.user.email}`);
    
    // Step 3: Get the task we just created
    const taskId = '689647960d609c51307ac213'; // From previous test
    console.log(`\n📋 Task ID: ${taskId}`);
    
    // Check task details
    const tasks = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const task = tasks.data.find(t => t.id === taskId);
    if (task) {
      console.log('✅ Task found:');
      console.log(`   Title: ${task.title}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   NGO ID: ${task.postedBy}`);
    } else {
      console.log('❌ Task not found in task list');
    }
    
    // Check applications for this task
    const applications = await axios.get(`${BASE_URL}/tasks/${taskId}/applications`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log(`\n📝 Applications: ${applications.data.length}`);
    if (applications.data.length > 0) {
      const app = applications.data[0];
      console.log(`   Application ID: ${app._id}`);
      console.log(`   Volunteer ID: ${app.volunteerId}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Task ID: ${app.taskId}`);
    }
    
    // Check attendance records
    try {
      const attendance = await axios.get(`${BASE_URL}/attendance?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      console.log(`\n👥 Attendance records: ${attendance.data.length}`);
      if (attendance.data.length > 0) {
        const att = attendance.data[0];
        console.log(`   Volunteer ID: ${att.volunteerId}`);
        console.log(`   Status: ${att.status}`);
        console.log(`   Hours: ${att.hoursCompleted}`);
      }
    } catch (attError) {
      console.log('⚠️ Could not fetch attendance (might be normal)');
    }
    
    // Now try certificate generation with exact IDs
    console.log('\n🎯 Attempting certificate generation...');
    if (applications.data.length > 0) {
      const volunteerId = applications.data[0].volunteerId;
      console.log(`Using volunteer ID: ${volunteerId}`);
      console.log(`Using task ID: ${taskId}`);
      
      try {
        const certResponse = await axios.post(`${BASE_URL}/certificates/generate`, {
          taskId: taskId,
          volunteerId: volunteerId
        }, {
          headers: { Authorization: `Bearer ${ngoToken}` }
        });
        console.log('🎉 Certificate generation SUCCESS!');
        console.log(`Certificate ID: ${certResponse.data.id}`);
      } catch (certError) {
        console.log('❌ Certificate generation failed:');
        console.log(`Status: ${certError.response?.status}`);
        console.log(`Error: ${JSON.stringify(certError.response?.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugJoyleneCertificate();
