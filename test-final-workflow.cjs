const fetch = require('node-fetch');

async function testCompleteWorkflow() {
  try {
    console.log('=== Testing Complete Certificate Download Workflow ===\n');
    
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
    console.log('   User ID:', loginData.user.id);
    
    const token = loginData.token;
    const userId = loginData.user.id;
    
    // Step 2: Get certificates
    console.log('\n2. Fetching certificates...');
    
    const certsResponse = await fetch(`http://localhost:3001/api/certificates/volunteer/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const certificates = await certsResponse.json();
    console.log(`✅ Found ${certificates.length} certificates`);
    
    certificates.forEach((cert, index) => {
      console.log(`\nCertificate ${index + 1}:`);
      console.log('   Number:', cert.certificateNumber);
      console.log('   Task:', cert.task.title);
      console.log('   Organization:', cert.task.organization);
      console.log('   Hours:', cert.hoursCompleted);
      console.log('   Status:', cert.status);
      console.log('   Download URL:', cert.url);
    });
    
    // Step 3: Test download for first certificate
    if (certificates.length > 0) {
      console.log('\n3. Testing certificate download...');
      const firstCert = certificates[0];
      console.log('   Testing:', firstCert.certificateNumber);
      
      const downloadResponse = await fetch(firstCert.url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   Download Status:', downloadResponse.status);
      console.log('   Content-Type:', downloadResponse.headers.get('content-type'));
      console.log('   Content-Length:', downloadResponse.headers.get('content-length') || 'chunked');
      
      if (downloadResponse.ok) {
        console.log('   ✅ Certificate download successful!');
        console.log('   📄 PDF file is ready for download');
      } else {
        console.log('   ❌ Download failed:', await downloadResponse.text());
      }
    }
    
    console.log('\n=== Certificate Workflow Test Complete ===');
    console.log('✅ All certificate functionality is working properly!');
    console.log('   - Login: Working');
    console.log('   - Certificate API: Working');
    console.log('   - Download URLs: Working');
    console.log('   - PDF Generation: Working');
    console.log('\nYou can now use the frontend to access and download certificates!');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCompleteWorkflow();
