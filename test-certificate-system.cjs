const axios = require('axios');

async function testCertificateSystem() {
  try {
    console.log('🧪 Testing Certificate System...\n');
    
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    try {
      const healthCheck = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend not accessible, trying to get tasks anyway...');
    }
    
    // Test 2: Login as NGO (should be able to generate certificates)
    console.log('\n2. Testing NGO login...');
    const ngoEmail = 'contact@oceanguardians.org'; // From test data
    const password = 'password123';
    
    let ngoToken;
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: ngoEmail,
        password: password
      });
      ngoToken = loginResponse.data.token;
      console.log('✅ NGO login successful');
    } catch (error) {
      console.log('❌ NGO login failed:', error.response?.data || error.message);
      return;
    }
    
    // Test 3: Get tasks
    console.log('\n3. Getting all tasks...');
    try {
      const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      
      const tasks = tasksResponse.data;
      console.log(`Found ${tasks.length} tasks:`);
      
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} (ID: ${task.id}, Status: ${task.status})`);
      });
      
      // Look for "joy test 3"
      const joyTest3 = tasks.find(task => task.title.toLowerCase().includes('joy test 3'));
      if (joyTest3) {
        console.log('\n✅ Found "joy test 3" task:', {
          id: joyTest3.id,
          title: joyTest3.title,
          status: joyTest3.status,
          date: joyTest3.date
        });
        
        // Test 4: Get applications for this task
        console.log('\n4. Getting applications for joy test 3...');
        try {
          const applicationsResponse = await axios.get(`http://localhost:3001/api/tasks/${joyTest3.id}/applications`, {
            headers: { Authorization: `Bearer ${ngoToken}` }
          });
          
          const applications = applicationsResponse.data;
          console.log('Applications response:', typeof applications, applications);
          
          // Handle both array and object responses
          let appsArray = Array.isArray(applications) ? applications : [applications];
          
          console.log(`Found ${appsArray.length} applications for joy test 3:`);
          appsArray.forEach(app => {
            const volunteerName = app.volunteerId?.name || app.volunteerName || app.name || 'Unknown';
            const volunteerEmail = app.volunteerId?.email || app.volunteerEmail || app.email || 'Unknown';
            console.log(`  - ${volunteerName} (${volunteerEmail}): ${app.status}`);
          });
          
          const approvedApp = appsArray.find(app => app.status === 'approved');
          if (approvedApp) {
            const volunteerName = approvedApp.volunteerId?.name || approvedApp.volunteerName || approvedApp.name;
            console.log('\n✅ Found approved volunteer:', volunteerName);
            
            // Test 5: Check attendance
            console.log('\n5. Checking attendance for joy test 3...');
            try {
              const attendanceResponse = await axios.get(`http://localhost:3001/api/attendance/task/${joyTest3.id}`, {
                headers: { Authorization: `Bearer ${ngoToken}` }
              });
              
              const attendance = attendanceResponse.data;
              console.log(`Attendance records:`, attendance);
              
              // Handle the attendance structure
              let presentVolunteers = [];
              if (attendance.volunteers && Array.isArray(attendance.volunteers)) {
                presentVolunteers = attendance.volunteers.filter(record => record.attendanceStatus === 'present');
              }
              console.log(`Present volunteers: ${presentVolunteers.length}`);
              
              if (presentVolunteers.length > 0) {
                console.log('\n✅ Perfect! We have approved volunteers who were present');
                console.log('This task should be ready for certificate generation!');
                
                // Test 6: Try to generate certificate
                console.log('\n6. Testing certificate generation...');
                const volunteerId = approvedApp.volunteerId._id || approvedApp.volunteerId;
                
                try {
                  const certResponse = await axios.post('http://localhost:3001/api/certificates/generate', {
                    taskId: joyTest3.id,
                    volunteerId: volunteerId
                  }, {
                    headers: { Authorization: `Bearer ${ngoToken}` }
                  });
                  
                  console.log('✅ Certificate generated successfully!');
                  console.log('Certificate URL:', certResponse.data.certificateUrl);
                  console.log('Details:', certResponse.data.task);
                  
                } catch (certError) {
                  console.log('❌ Certificate generation failed:', certError.response?.data || certError.message);
                }
                
              } else {
                console.log('❌ No volunteers marked as present');
              }
              
            } catch (attendanceError) {
              console.log('❌ Failed to get attendance:', attendanceError.response?.data || attendanceError.message);
            }
            
          } else {
            console.log('❌ No approved volunteers found');
          }
          
        } catch (appError) {
          console.log('❌ Failed to get applications:', appError.response?.data || appError.message);
        }
        
      } else {
        console.log('❌ "joy test 3" task not found');
        console.log('Available tasks:', tasks.map(t => t.title));
      }
      
    } catch (error) {
      console.log('❌ Failed to get tasks:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCertificateSystem();
