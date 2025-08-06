import fetch from 'node-fetch';

async function createTestNGO() {
    console.log('🏢 Creating test NGO account...\n');
    
    try {
        // Create NGO account with required fields
        const signupResponse = await fetch('http://localhost:3001/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'oceanguardians@ngo.com',
                password: 'password123',
                name: 'Ocean Guardians',
                role: 'ngo'
            })
        });
        
        const signupData = await signupResponse.json();
        console.log('Signup response:', signupData);
        
        if (signupData.token) {
            console.log('✅ NGO account created successfully!');
            console.log('📧 Email: oceanguardians@ngo.com');
            console.log('🔑 Password: password123');
            console.log('👤 Name:', signupData.user.name);
            console.log('🎭 Role:', signupData.user.role);
            
            // Now test login
            console.log('\n🔐 Testing login...');
            const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'oceanguardians@ngo.com',
                    password: 'password123'
                })
            });
            
            const loginData = await loginResponse.json();
            if (loginData.token) {
                console.log('✅ Login successful!');
                console.log('🎯 Ready for NGO Dashboard Enhancement!');
                return { email: 'oceanguardians@ngo.com', password: 'password123' };
            } else {
                console.log('❌ Login failed:', loginData.error);
            }
        } else {
            console.log('❌ NGO signup failed:', signupData.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestNGO();
