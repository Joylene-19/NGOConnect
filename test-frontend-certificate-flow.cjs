const fetch = require('node-fetch');

async function testFrontendCertificateFetch() {
  try {
    console.log('=== Testing Frontend Certificate Fetch (matching frontend logic) ===\n');
    
    // Step 1: Login as Joylene
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
    
    // Step 2: Fetch certificates using the same endpoint as frontend
    console.log('2. Fetching certificates from /api/certificates/my...');
    
    const response = await fetch('http://localhost:3001/api/certificates/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ API returned ${data.length} certificates`);
      
      // Step 3: Transform data exactly like frontend does
      console.log('\n3. Transforming data like frontend...');
      
      const transformedCertificates = data.map((cert) => ({
        id: cert.id,
        taskTitle: cert.task?.title || 'Unknown Task',
        ngoName: cert.task?.organization || 'Unknown Organization',
        issuedAt: cert.generatedAt,
        certificateUrl: cert.url || cert.certificateUrl, // Use the actual URL from backend
        hours: cert.hoursCompleted
      }));
      
      console.log('   Frontend would create these certificate objects:');
      
      transformedCertificates.forEach((cert, index) => {
        console.log(`\n   Certificate ${index + 1}:`);
        console.log('     id:', cert.id);
        console.log('     taskTitle:', cert.taskTitle);
        console.log('     ngoName:', cert.ngoName);
        console.log('     hours:', cert.hours);
        console.log('     issuedAt:', cert.issuedAt);
        console.log('     certificateUrl:', cert.certificateUrl);
        console.log('     -> Download button would use href:', cert.certificateUrl);
      });
      
      // Step 4: Test if the URLs work
      console.log('\n4. Testing download URLs...');
      
      for (let i = 0; i < transformedCertificates.length; i++) {
        const cert = transformedCertificates[i];
        console.log(`\n   Testing Certificate ${i + 1} download...`);
        console.log('   URL:', cert.certificateUrl);
        
        try {
          const downloadResponse = await fetch(cert.certificateUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('   Status:', downloadResponse.status);
          console.log('   Content-Type:', downloadResponse.headers.get('content-type'));
          
          if (downloadResponse.ok) {
            console.log('   ✅ Download would work in frontend!');
          } else {
            console.log('   ❌ Download would fail:', await downloadResponse.text());
          }
        } catch (err) {
          console.log('   ❌ Download error:', err.message);
        }
      }
      
    } else {
      console.error('❌ Failed to fetch certificates:', await response.text());
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFrontendCertificateFetch();
