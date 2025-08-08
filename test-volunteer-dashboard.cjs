const axios = require('axios');

async function testVolunteerCertificates() {
  try {
    console.log('🧪 Testing Volunteer Certificate Dashboard...\n');
    
    // Login as volunteer Sarah Johnson
    const volunteerEmail = 'sarah.johnson@email.com';
    const password = 'password123';
    
    console.log('1. Logging in as volunteer...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: volunteerEmail,
      password: password
    });
    const volunteerToken = loginResponse.data.token;
    console.log('✅ Volunteer login successful');
    
    // Test getting volunteer's certificates
    console.log('\n2. Getting volunteer certificates...');
    try {
      const certificatesResponse = await axios.get('http://localhost:3001/api/certificates/my', {
        headers: { Authorization: `Bearer ${volunteerToken}` }
      });
      
      console.log('✅ Certificates retrieved:');
      console.log('Number of certificates:', certificatesResponse.data.length);
      
      if (certificatesResponse.data.length > 0) {
        certificatesResponse.data.forEach((cert, index) => {
          console.log(`Certificate ${index + 1}:`, {
            id: cert.id,
            taskTitle: cert.taskTitle,
            organizationName: cert.organizationName,
            status: cert.status,
            generatedAt: cert.generatedAt,
            certificateUrl: cert.certificateUrl
          });
        });
      } else {
        console.log('No certificates found in database');
      }
      
    } catch (certError) {
      console.log('❌ Failed to get certificates:', certError.response?.data || certError.message);
    }
    
    // Test the manual certificate generation for joy test 3
    console.log('\n3. Testing manual certificate generation...');
    
    // First login as NGO
    const ngoLoginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'contact@oceanguardians.org',
      password: 'password123'
    });
    const ngoToken = ngoLoginResponse.data.token;
    
    // Get volunteer ID
    const volunteerUsersResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    // Generate certificate manually to test the endpoint
    try {
      const certGenerateResponse = await axios.post('http://localhost:3001/api/certificates/generate', {
        taskId: '6893d67a7d63036a2cac1b34', // joy test 3 ID
        volunteerId: '6867db7a8d444eed1cdcf817'  // Sarah Johnson ID
      }, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      
      console.log('✅ Manual certificate generation successful!');
      console.log('Certificate details:', certGenerateResponse.data);
      
    } catch (manualGenError) {
      console.log('Manual generation error:', manualGenError.response?.data || manualGenError.message);
    }
    
    // Check certificates again after manual generation
    console.log('\n4. Checking certificates again after manual generation...');
    try {
      const certificatesResponse2 = await axios.get('http://localhost:3001/api/certificates/my', {
        headers: { Authorization: `Bearer ${volunteerToken}` }
      });
      
      console.log('Updated certificates count:', certificatesResponse2.data.length);
      
    } catch (certError2) {
      console.log('❌ Failed to get updated certificates:', certError2.response?.data || certError2.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testVolunteerCertificates();
