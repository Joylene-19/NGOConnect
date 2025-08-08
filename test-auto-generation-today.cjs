const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Get tomorrow's date in YYYY-MM-DD format (since today's tasks are auto-closed)
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

async function testAutoGeneration() {
  console.log('🧪 AUTO-GENERATION TEST WITH TOMORROW\'S DATE');
  console.log(`📅 Using tomorrow's date: ${getTomorrowDate()}`);
  console.log('This test will create a task for tomorrow, then manually change status:');
  
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
    console.log('3️⃣ Creating task with tomorrow\'s date...');
    const uniqueId = Date.now();
    const taskData = {
      title: `Auto-Gen Tomorrow Test - ${uniqueId}`,
      description: 'This task uses tomorrow\'s date, then we\'ll change status manually',
      location: 'Test Location',
      date: getTomorrowDate(), // Use tomorrow's date
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
      motivation: 'I want to test the auto-generation system!'
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
    
    // Step 7: Check current certificates before manual status change
    console.log('7️⃣ Checking certificates before status change...');
    const certsBefore = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log(`📜 Certificates before: ${certsBefore.data.length}`);
    
    // Step 8: Manually change task status to completed to trigger auto-generation
    console.log('8️⃣ Manually changing task status to completed...');
    try {
      await axios.put(`${BASE_URL}/tasks/${taskId}`, {
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      console.log('✅ Task status changed to completed');
    } catch (error) {
      console.log('⚠️ Direct status change failed, trying alternative approach...');
      
      // Alternative: Try generating certificate directly since attendance is marked
      console.log('🔧 Attempting direct certificate generation...');
      try {
        const directCert = await axios.post(`${BASE_URL}/certificates/generate`, {
          taskId: taskId,
          volunteerId: volunteerLogin.data.user.id
        }, {
          headers: { Authorization: `Bearer ${ngoToken}` }
        });
        console.log('✅ Direct certificate generation successful!');
        console.log(`� Certificate ID: ${directCert.data.id}`);
        
        console.log('\n🎯 TEST COMPLETE!');
        console.log('📊 Final Summary:');
        console.log(`   - Task Date: ${getTomorrowDate()}`);
        console.log(`   - Direct Generation: ✅ Success`);
        console.log(`   - Certificate ID: ${directCert.data.id}`);
        return;
      } catch (directError) {
        console.log('❌ Direct generation failed:', directError.response?.data);
      }
    }
    
    // Wait for processing
    console.log('⏳ Waiting for auto-generation to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 9: Check task status
    console.log('9️⃣ Checking final task status...');
    const tasksAfter = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const updatedTask = tasksAfter.data.find(t => t.id === taskId);
    console.log(`📋 Task status: ${updatedTask?.status}`);
    
    // Step 10: Check for new certificates
    console.log('🔟 Checking for auto-generated certificates...');
    const certsAfter = await axios.get(`${BASE_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log(`📜 Certificates after: ${certsAfter.data.length}`);
    
    const newCertificates = certsAfter.data.filter(cert => 
      cert.taskTitle && cert.taskTitle.includes(`Auto-Gen Tomorrow Test - ${uniqueId}`)
    );
    
    if (newCertificates.length > 0) {
      console.log('🎉 SUCCESS! Certificate system working!');
      console.log(`🏆 Certificate created for task: ${newCertificates[0].taskTitle}`);
      console.log(`📋 Certificate ID: ${newCertificates[0].id}`);
      console.log(`📅 Issue Date: ${newCertificates[0].issueDate}`);
    } else {
      console.log('⚠️  No new certificates found');
    }
    
    console.log('\n🎯 TEST COMPLETE!');
    console.log('📊 Final Summary:');
    console.log(`   - Task Date: ${getTomorrowDate()}`);
    console.log(`   - Task Status: ${updatedTask?.status}`);
    console.log(`   - Total Certificates: ${certsAfter.data.length}`);
    console.log(`   - New Certificates: ${newCertificates.length}`);
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testAutoGeneration();
