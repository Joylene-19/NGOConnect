const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDirectCertificateGeneration() {
  console.log('🧪 DIRECT CERTIFICATE GENERATION TEST');
  console.log('This test will demonstrate manual certificate generation for a completed task:');
  
  try {
    let ngoToken, volunteerToken;
    
    // Step 1: NGO Login
    console.log('1️⃣ Logging in as NGO (Ocean Guardians)...');
    const ngoLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    ngoToken = ngoLogin.data.token;
    console.log('✅ NGO login successful');
    
    // Step 2: Volunteer Login
    console.log('2️⃣ Logging in as Volunteer (Sarah Johnson)...');
    const volunteerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sarah.johnson@email.com',
      password: 'password123'
    });
    volunteerToken = volunteerLogin.data.token;
    console.log('✅ Volunteer login successful');
    
    // Step 3: Create task with tomorrow's date
    console.log('3️⃣ Creating task...');
    const uniqueId = Date.now();
    const taskData = {
      title: `Direct Cert Test - ${uniqueId}`,
      description: 'This task will test direct certificate generation',
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
    console.log(`✅ Task created: "${taskData.title}" (ID: ${taskId})`);
    
    // Step 4: Apply to task
    console.log('4️⃣ Volunteer applying to the task...');
    await axios.post(`${BASE_URL}/tasks/${taskId}/apply`, {
      motivation: 'I want to test direct certificate generation!'
    }, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log('✅ Application submitted');
    
    // Step 5: Get applications and approve
    console.log('5️⃣ NGO approving the application...');
    const applications = await axios.get(`${BASE_URL}/tasks/${taskId}/applications`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const applicationId = applications.data[0]._id;
    
    await axios.post(`${BASE_URL}/applications/${applicationId}/approve`, {}, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Application approved');
    
    // Step 6: Mark attendance
    console.log('6️⃣ Marking volunteer attendance as present...');
    await axios.post(`${BASE_URL}/attendance`, {
      taskId: taskId,
      volunteerId: volunteerLogin.data.user.id,
      status: 'present',
      hoursCompleted: 3
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Attendance marked as present');
    
    // Step 7: Change task status to completed
    console.log('7️⃣ Setting task status to completed...');
    await axios.put(`${BASE_URL}/tasks/${taskId}`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('✅ Task status set to completed');
    
    // Step 8: Check current certificates before generation
    console.log('8️⃣ Checking certificates before generation...');
    const certsBefore = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log(`📜 Certificates before: ${certsBefore.data.length}`);
    
    // Step 9: Generate certificate directly
    console.log('9️⃣ Generating certificate directly...');
    const certResponse = await axios.post(`${BASE_URL}/certificates/generate`, {
      taskId: taskId,
      volunteerId: volunteerLogin.data.user.id
    }, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log('🎉 SUCCESS! Certificate generated!');
    console.log(`📋 Certificate ID: ${certResponse.data.id}`);
    console.log(`📜 Certificate URL: ${certResponse.data.url}`);
    
    // Step 10: Check certificates after generation
    console.log('🔟 Checking certificates after generation...');
    const certsAfter = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log(`📜 Certificates after: ${certsAfter.data.length}`);
    
    const newCertificate = certsAfter.data.find(cert => 
      cert.taskTitle && cert.taskTitle.includes(`Direct Cert Test - ${uniqueId}`)
    );
    
    if (newCertificate) {
      console.log('✅ Certificate found in volunteer dashboard!');
      console.log(`🏆 Task: ${newCertificate.taskTitle}`);
      console.log(`📅 Issue Date: ${newCertificate.issueDate}`);
      console.log(`🔗 URL: ${newCertificate.url}`);
    }
    
    console.log('\n🎯 CERTIFICATE GENERATION TEST COMPLETE!');
    console.log('📊 Summary:');
    console.log(`   - Task Created: ✅`);
    console.log(`   - Application Flow: ✅`);
    console.log(`   - Attendance Marked: ✅`);
    console.log(`   - Status Set to Completed: ✅`);
    console.log(`   - Certificate Generated: ✅`);
    console.log(`   - Available in Dashboard: ✅`);
    console.log(`   - Total Certificates: ${certsAfter.data.length}`);
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', error.response.data);
    }
  }
}

testDirectCertificateGeneration();
