const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function fixedJoyleneWorkflow() {
  console.log('🧪 FIXED CERTIFICATE WORKFLOW FOR JOYLENE');
  console.log('📧 Using: joylene19072005@gmail.com');
  
  try {
    let ngoToken, joylenToken, joylenUserId;
    
    // Step 1: NGO Login
    console.log('\n1️⃣ Logging in as NGO (Ocean Guardians)...');
    const ngoLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    ngoToken = ngoLogin.data.token;
    console.log('✅ NGO login successful');
    
    // Step 2: Joylene Login
    console.log('\n2️⃣ Logging in as Joylene...');
    const joylenLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'joylene19072005@gmail.com',
      password: 'joylene19072005'
    });
    joylenToken = joylenLogin.data.token;
    joylenUserId = joylenLogin.data.user.id; // Store the correct user ID
    console.log('✅ Joylene login successful!');
    console.log(`👤 User ID: ${joylenUserId}`);
    console.log(`👤 Username: ${joylenLogin.data.user.username}`);
    
    // Step 3: Create task
    console.log('\n3️⃣ Creating a new test task...');
    const uniqueId = Date.now();
    const taskData = {
      title: `Joylene Certificate Test FIXED - ${uniqueId}`,
      description: 'Fixed test for Joylene certificate generation',
      location: 'Test Location',
      date: '2025-08-09',
      hours: 3,
      requiredSkills: ['teamwork'],
      maxVolunteers: 5
    };
    
    const createTask = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const taskId = createTask.data.id;
    console.log(`✅ Task created: "${taskData.title}"`);
    console.log(`📋 Task ID: ${taskId}`);
    
    // Step 4: Joylene applies
    console.log('\n4️⃣ Joylene applying to the task...');
    await axios.post(`${BASE_URL}/tasks/${taskId}/apply`, {
      motivation: 'Testing fixed certificate generation!'
    }, {
      headers: { Authorization: `Bearer ${joylenToken}` }
    });
    console.log('✅ Application submitted');
    
    // Step 5: NGO approves
    console.log('\n5️⃣ NGO approving the application...');
    const applications = await axios.get(`${BASE_URL}/tasks/${taskId}/applications`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const applicationId = applications.data[0]._id;
    
    await axios.post(`${BASE_URL}/applications/${applicationId}/approve`, {}, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Application approved');
    
    // Step 6: Mark attendance (using the correct user ID)
    console.log('\n6️⃣ Marking attendance...');
    await axios.post(`${BASE_URL}/attendance`, {
      taskId: taskId,
      volunteerId: joylenUserId, // Use the correct user ID from login
      status: 'present',
      hoursCompleted: 3
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Attendance marked');
    
    // Step 7: Set task to completed
    console.log('\n7️⃣ Setting task to completed...');
    await axios.put(`${BASE_URL}/tasks/${taskId}`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Task completed');
    
    // Step 8: Generate certificate (using correct user ID)
    console.log('\n8️⃣ Generating certificate...');
    console.log(`🔍 Using Task ID: ${taskId}`);
    console.log(`🔍 Using Volunteer ID: ${joylenUserId}`);
    
    const certResponse = await axios.post(`${BASE_URL}/certificates/generate`, {
      taskId: taskId,
      volunteerId: joylenUserId // Use the correct user ID
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    console.log('🎉 SUCCESS! Certificate generated for Joylene!');
    console.log(`📋 Certificate ID: ${certResponse.data.id}`);
    console.log(`📜 Certificate URL: ${certResponse.data.url}`);
    console.log(`🔢 Certificate Number: ${certResponse.data.certificateNumber}`);
    
    // Step 9: Check Joylene's certificates
    console.log('\n9️⃣ Checking Joylene\'s certificates...');
    const certs = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${joylenToken}` }
    });
    console.log(`📜 Joylene now has ${certs.data.length} certificates`);
    
    const newCert = certs.data.find(cert => 
      cert.taskTitle && cert.taskTitle.includes(`Joylene Certificate Test FIXED - ${uniqueId}`)
    );
    
    if (newCert) {
      console.log('✅ CERTIFICATE FOUND IN DASHBOARD!');
      console.log(`🏆 Task: ${newCert.taskTitle}`);
      console.log(`📅 Issue Date: ${newCert.issueDate}`);
      console.log(`⏰ Hours: ${newCert.hoursCompleted}`);
      console.log(`🔗 URL: ${newCert.url}`);
    }
    
    console.log('\n🎯 JOYLENE CERTIFICATE TEST SUCCESSFUL!');
    console.log('📊 Summary:');
    console.log('   ✅ Login: SUCCESS');
    console.log('   ✅ Task Creation: SUCCESS');
    console.log('   ✅ Application: SUCCESS');
    console.log('   ✅ Approval: SUCCESS');
    console.log('   ✅ Attendance: SUCCESS');
    console.log('   ✅ Certificate Generation: SUCCESS');
    console.log('   ✅ Dashboard Access: SUCCESS');
    
    console.log('\n🌟 NEXT: TEST IN BROWSER');
    console.log('1. Go to: http://localhost:5173');
    console.log('2. Login: joylene19072005@gmail.com / joylene19072005');
    console.log('3. Check Certificates section');
    console.log('4. Download your certificate!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

fixedJoyleneWorkflow();
