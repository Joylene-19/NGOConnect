const fetch = require('node-fetch');

async function testJoyleneLoginAndCertificates() {
  try {
    console.log('=== Testing Joylene Login and Certificate Access ===\n');
    
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
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Token type:', typeof loginData.token);
    console.log('   User ID:', loginData.user.id);
    console.log('   User name:', loginData.user.name);
    
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
    
    if (!certsResponse.ok) {
      console.error('❌ Certificate fetch failed:', certsResponse.status, await certsResponse.text());
      return;
    }
    
    const certificates = await certsResponse.json();
    console.log(`✅ Found ${certificates.length} certificates`);
    
    certificates.forEach((cert, index) => {
      console.log(`\nCertificate ${index + 1}:`);
      console.log('   ID:', cert.id);
      console.log('   Certificate Number:', cert.certificateNumber);
      console.log('   Certificate URL:', cert.certificateUrl);
      console.log('   URL field:', cert.url);
      console.log('   Status:', cert.status);
      console.log('   Task:', cert.task?.title);
      console.log('   Organization:', cert.task?.organization);
      console.log('   Hours:', cert.hoursCompleted);
    });
    
    // Step 3: Test download URL for first certificate
    if (certificates.length > 0) {
      console.log('\n3. Testing certificate download...');
      const firstCert = certificates[0];
      
      // Test both certificateUrl and url fields
      const urlsToTest = [
        { name: 'certificateUrl', url: firstCert.certificateUrl },
        { name: 'url', url: firstCert.url }
      ];
      
      for (const { name, url } of urlsToTest) {
        if (url) {
          console.log(`\nTesting ${name}: ${url}`);
          
          const downloadResponse = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log(`   Status: ${downloadResponse.status}`);
          console.log(`   Content-Type: ${downloadResponse.headers.get('content-type')}`);
          console.log(`   Content-Disposition: ${downloadResponse.headers.get('content-disposition')}`);
          
          if (downloadResponse.ok) {
            console.log(`   ✅ ${name} download working!`);
          } else {
            console.log(`   ❌ ${name} download failed:`, await downloadResponse.text());
          }
        } else {
          console.log(`\n❌ ${name} is null/undefined`);
        }
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testJoyleneLoginAndCertificates();
