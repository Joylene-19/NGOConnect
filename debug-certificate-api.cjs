const fetch = require('node-fetch');

async function debugCertificateAPI() {
  try {
    console.log('=== Debug Certificate API ===\n');
    
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
    console.log('   User Role:', loginData.user.role);
    console.log('   User Name:', loginData.user.name || 'undefined');
    
    const token = loginData.token;
    const userId = loginData.user.id;
    
    // Step 2: Test URL construction
    const url = `http://localhost:3001/api/certificates/volunteer/${userId}`;
    console.log('\n2. Testing URL:', url);
    
    // Step 3: Make request with debugging
    console.log('\n3. Making request with auth header...');
    
    const certsResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Response Status:', certsResponse.status);
    console.log('   Response Headers:', Object.fromEntries(certsResponse.headers.entries()));
    
    const responseText = await certsResponse.text();
    console.log('   Raw Response Body:', responseText);
    
    if (certsResponse.ok) {
      try {
        const certificates = JSON.parse(responseText);
        console.log(`   Parsed: Found ${certificates.length} certificates`);
        
        certificates.forEach((cert, index) => {
          console.log(`\n   Certificate ${index + 1}:`);
          console.log('     ID:', cert.id);
          console.log('     Number:', cert.certificateNumber);
          console.log('     Status:', cert.status);
          console.log('     URL:', cert.url || cert.certificateUrl);
        });
      } catch (parseError) {
        console.error('   JSON Parse Error:', parseError.message);
      }
    } else {
      console.error('   ❌ Request failed');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugCertificateAPI();
