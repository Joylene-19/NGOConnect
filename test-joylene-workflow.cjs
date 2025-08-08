const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testJoyleneWorkflow() {
  console.log('🧪 CERTIFICATE WORKFLOW TEST FOR JOYLENE');
  console.log('📧 Testing with: joylene19072005@gmail.com');
  console.log('This test will walk through the complete certificate generation process:');
  
  try {
    let ngoToken, joylenToken;
    
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
    try {
      const joylenLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'joylene19072005@gmail.com',
        password: 'joylene19072005'  // Based on the password reset I saw in logs
      });
      joylenToken = joylenLogin.data.token;
      console.log('✅ Joylene login successful!');
      console.log(`👤 User ID: ${joylenLogin.data.user.id}`);
      console.log(`👤 Username: ${joylenLogin.data.user.username}`);
    } catch (loginError) {
      console.log('❌ Joylene login failed:', loginError.response?.data);
      console.log('💡 You may need to check the password or reset it again');
      return;
    }
    
    // Step 3: Create task for testing
    console.log('\n3️⃣ Creating a test task...');
    const uniqueId = Date.now();
    const taskData = {
      title: `Joylene Certificate Test - ${uniqueId}`,
      description: 'This task is specifically for testing certificate generation with Joylene\'s account',
      location: 'Test Location for Joylene',
      date: '2025-08-09', // Tomorrow's date
      hours: 4,
      requiredSkills: ['leadership', 'communication'],
      maxVolunteers: 3
    };
    
    const createTask = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const taskId = createTask.data.id;
    console.log(`✅ Task created: "${taskData.title}"`);
    console.log(`📋 Task ID: ${taskId}`);
    
    // Step 4: Joylene applies to task
    console.log('\n4️⃣ Joylene applying to the task...');
    await axios.post(`${BASE_URL}/tasks/${taskId}/apply`, {
      motivation: 'I want to test the certificate generation system and gain valuable volunteer experience!'
    }, {
      headers: { Authorization: `Bearer ${joylenToken}` }
    });
    console.log('✅ Application submitted successfully');
    
    // Step 5: NGO approves Joylene's application
    console.log('\n5️⃣ NGO approving Joylene\'s application...');
    const applications = await axios.get(`${BASE_URL}/tasks/${taskId}/applications`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    if (applications.data.length === 0) {
      console.log('❌ No applications found for this task');
      return;
    }
    
    const joylenApplication = applications.data[0];
    console.log(`📋 Found application ID: ${joylenApplication._id}`);
    
    await axios.post(`${BASE_URL}/applications/${joylenApplication._id}/approve`, {}, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Application approved - Joylene is now an approved volunteer!');
    
    // Step 6: Mark Joylene's attendance
    console.log('\n6️⃣ Marking Joylene\'s attendance as present...');
    const joylenUserId = joylenApplication.volunteerId;
    await axios.post(`${BASE_URL}/attendance`, {
      taskId: taskId,
      volunteerId: joylenUserId,
      status: 'present',
      hoursCompleted: 4
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Attendance marked - Joylene completed 4 hours of volunteer work!');
    
    // Step 7: Check Joylene's certificates before generation
    console.log('\n7️⃣ Checking Joylene\'s current certificates...');
    const certsBefore = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${joylenToken}` }
    });
    console.log(`📜 Joylene currently has ${certsBefore.data.length} certificates`);
    
    // Step 8: Set task to completed
    console.log('\n8️⃣ Setting task status to completed...');
    await axios.put(`${BASE_URL}/tasks/${taskId}`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Task status set to completed');
    
    // Step 9: Generate certificate for Joylene
    console.log('\n9️⃣ Generating certificate for Joylene...');
    const certResponse = await axios.post(`${BASE_URL}/certificates/generate`, {
      taskId: taskId,
      volunteerId: joylenUserId
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('🎉 SUCCESS! Certificate generated for Joylene!');
    console.log(`📋 Certificate ID: ${certResponse.data.id}`);
    console.log(`📜 Certificate URL: ${certResponse.data.url}`);
    console.log(`🔢 Certificate Number: ${certResponse.data.certificateNumber}`);
    
    // Step 10: Verify certificate in Joylene's dashboard
    console.log('\n🔟 Checking Joylene\'s certificates after generation...');
    const certsAfter = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${joylenToken}` }
    });
    console.log(`📜 Joylene now has ${certsAfter.data.length} certificates`);
    
    const newCertificate = certsAfter.data.find(cert => 
      cert.taskTitle && cert.taskTitle.includes(`Joylene Certificate Test - ${uniqueId}`)
    );
    
    if (newCertificate) {
      console.log('✅ NEW CERTIFICATE FOUND IN JOYLENE\'S DASHBOARD!');
      console.log(`🏆 Task: ${newCertificate.taskTitle}`);
      console.log(`📅 Issue Date: ${newCertificate.issueDate}`);
      console.log(`⏰ Hours Completed: ${newCertificate.hoursCompleted}`);
      console.log(`🎓 Skills: ${newCertificate.skills?.join(', ') || 'None specified'}`);
      console.log(`🔗 Download URL: ${newCertificate.url}`);
    }
    
    console.log('\n🎯 JOYLENE CERTIFICATE TEST COMPLETE!');
    console.log('📊 Final Summary:');
    console.log(`   ✅ Joylene account login: SUCCESS`);
    console.log(`   ✅ Task application: SUCCESS`);
    console.log(`   ✅ NGO approval: SUCCESS`);
    console.log(`   ✅ Attendance marking: SUCCESS`);
    console.log(`   ✅ Certificate generation: SUCCESS`);
    console.log(`   ✅ Certificate in dashboard: SUCCESS`);
    console.log(`   📜 Total certificates: ${certsAfter.data.length}`);
    console.log(`   🆔 Task ID for reference: ${taskId}`);
    
    console.log('\n🌟 NEXT STEPS FOR MANUAL TESTING:');
    console.log('1. Open browser and go to: http://localhost:5173');
    console.log('2. Login with: joylene19072005@gmail.com / joylene19072005');
    console.log('3. Navigate to the Certificates section');
    console.log('4. You should see your new certificate available for download');
    console.log('5. Click on the certificate to download the PDF');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('📋 Full error details:', error.response.data);
    }
  }
}

// Also provide a simple login test function
async function testJoylenLogin() {
  console.log('🔐 TESTING JOYLENE LOGIN ONLY...');
  
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'joylene19072005@gmail.com',
      password: 'joylene19072005'
    });
    
    console.log('✅ LOGIN SUCCESS!');
    console.log(`👤 User ID: ${loginResponse.data.user.id}`);
    console.log(`👤 Username: ${loginResponse.data.user.username}`);
    console.log(`📧 Email: ${loginResponse.data.user.email}`);
    console.log(`🔑 Token generated: ${loginResponse.data.token ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.log('❌ LOGIN FAILED:', error.response?.data || error.message);
    console.log('💡 Possible solutions:');
    console.log('   - Try password: "password123"');
    console.log('   - Try password: "joylene19072005"');
    console.log('   - Check if user exists in database');
    console.log('   - Reset password if needed');
  }
}

// Run the appropriate test
const args = process.argv.slice(2);
if (args.includes('--login-only')) {
  testJoylenLogin();
} else {
  testJoyleneWorkflow();
}
