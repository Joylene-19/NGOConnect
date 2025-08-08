const axios = require('axios');

async function checkJoylenesCertificates() {
  console.log('🔍 CHECKING JOYLENE\'S CERTIFICATES...');
  
  try {
    // Login as Joylene
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'joylene19072005@gmail.com',
      password: 'joylene19072005'
    });
    
    console.log('✅ Login successful');
    
    // Get certificates
    const certsResponse = await axios.get('http://localhost:3001/api/certificates/my', {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    
    console.log(`📜 Found ${certsResponse.data.length} certificates`);
    
    certsResponse.data.forEach((cert, index) => {
      console.log(`\n📋 Certificate ${index + 1}:`);
      console.log(`   ID: ${cert.id}`);
      console.log(`   Title: ${cert.taskTitle}`);
      console.log(`   URL: ${cert.url}`);
      console.log(`   Certificate Number: ${cert.certificateNumber}`);
      console.log(`   Generated: ${cert.generatedAt}`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkJoylenesCertificates();
