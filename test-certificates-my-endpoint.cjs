const fetch = require('node-fetch');

async function testCertificatesMyEndpoint() {
  try {
    console.log('=== Testing /api/certificates/my Endpoint ===\n');
    
    // Step 1: Login as Joylene
    console.log('1. Logging in as joylene19072005@gmail.com...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'joylene19072005@gmail.com',
        password: 'joylene19072005'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.token;
    
    // Step 2: Test /api/certificates/my
    console.log('\n2. Testing /api/certificates/my...');
    
    const certsResponse = await fetch('http://localhost:3001/api/certificates/my', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Response Status:', certsResponse.status);
    
    if (certsResponse.ok) {
      const certificates = await certsResponse.json();
      console.log(`   ✅ Found ${certificates.length} certificates`);
      
      certificates.forEach((cert, index) => {
        console.log(`\n   Certificate ${index + 1}:`);
        console.log('     id:', cert.id);
        console.log('     certificateNumber:', cert.certificateNumber);
        console.log('     certificateUrl:', cert.certificateUrl);
        console.log('     url:', cert.url);
        console.log('     status:', cert.status);
        console.log('     hoursCompleted:', cert.hoursCompleted);
        console.log('     task.title:', cert.task?.title);
        console.log('     task.organization:', cert.task?.organization);
        console.log('     generatedAt:', cert.generatedAt);
      });
      
      console.log('\n3. Testing what frontend expects...');
      certificates.forEach((cert, index) => {
        console.log(`\n   Frontend mapping for Certificate ${index + 1}:`);
        console.log('     id:', cert.id);
        console.log('     taskTitle:', cert.task?.title); // This should map to taskTitle
        console.log('     ngoName:', cert.task?.organization); // This should map to ngoName
        console.log('     issuedAt:', cert.generatedAt); // This should map to issuedAt
        console.log('     certificateUrl:', cert.url || cert.certificateUrl);
        console.log('     hours:', cert.hoursCompleted);
      });
    } else {
      console.error('   ❌ Request failed:', await certsResponse.text());
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCertificatesMyEndpoint();
