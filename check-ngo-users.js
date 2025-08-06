import fetch from 'node-fetch';

async function checkNGOUsers() {
    console.log('🔍 Checking available NGO users...\n');
    
    try {
        // Try to get users endpoint (if available)
        const response = await fetch('http://localhost:3001/api/users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Users data:', data);
        } else {
            console.log('Users endpoint not available, trying to create test NGO...');
            
            // Try to create a test NGO account
            const signupResponse = await fetch('http://localhost:3001/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'oceanguardians@email.com',
                    password: 'password123',
                    name: 'Ocean Guardians Admin',
                    role: 'ngo',
                    organizationName: 'Ocean Guardians',
                    description: 'Marine conservation organization',
                    location: 'California, USA'
                })
            });
            
            const signupData = await signupResponse.json();
            if (signupData.token) {
                console.log('✅ Test NGO account created successfully!');
                console.log('📧 Email: oceanguardians@email.com');
                console.log('🔑 Password: password123');
                console.log('🏢 Organization:', signupData.user.organizationName);
            } else {
                console.log('❌ NGO signup failed:', signupData.error);
                
                // Try different credentials
                console.log('\n🔄 Trying alternative login credentials...');
                const testCredentials = [
                    { email: 'admin@oceanguardians.org', password: 'password123' },
                    { email: 'oceanguardians@email.com', password: 'password' },
                    { email: 'test@ngo.com', password: 'password123' },
                    { email: 'ngo@test.com', password: 'password' }
                ];
                
                for (const creds of testCredentials) {
                    console.log(`Trying: ${creds.email}`);
                    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(creds)
                    });
                    
                    const loginData = await loginResponse.json();
                    if (loginData.token) {
                        console.log(`✅ Login successful with: ${creds.email}`);
                        console.log('🏢 Organization:', loginData.user.organizationName);
                        return creds;
                    }
                }
                console.log('❌ No valid credentials found');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkNGOUsers();
