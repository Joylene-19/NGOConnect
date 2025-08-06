import fetch from 'node-fetch';

async function testNGODashboardAPIs() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('🚀 Testing NGO Dashboard APIs...\n');
    
    try {
        // Test NGO login
        console.log('1. Testing NGO Authentication...');
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'oceanguardians@ngo.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.token) {
            console.log('✅ NGO Login successful:', loginData.user.username);
            
            const token = loginData.token;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            console.log('\n2. Testing Available API Endpoints...');
            
            // Test available endpoints
            const endpoints = [
                { path: '/api/tasks', name: 'All Tasks' },
                { path: '/api/tasks/available', name: 'Available Tasks' },
                { path: '/api/my-applications', name: 'My Applications' },
                { path: '/api/my-task-applications', name: 'NGO Task Applications' },
                { path: '/api/my-pending-reviews', name: 'Pending Reviews' }
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${baseUrl}${endpoint.path}`, { headers });
                    const data = await response.json();
                    
                    if (response.ok) {
                        console.log(`✅ ${endpoint.name}: ${Array.isArray(data) ? data.length : Object.keys(data).length} items`);
                    } else {
                        console.log(`❌ ${endpoint.name}: ${data.error}`);
                    }
                } catch (error) {
                    console.log(`❌ ${endpoint.name}: ${error.message}`);
                }
            }
            
            console.log('\n3. Creating Sample Task for Testing...');
            // Create a sample task
            const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: 'Beach Cleanup Event',
                    description: 'Help us clean up the local beach and protect marine life',
                    location: 'Santa Monica Beach, CA',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                    duration: '4 hours',
                    category: 'Environmental',
                    maxVolunteers: 20,
                    requirements: 'Comfortable clothes and shoes',
                    urgency: 'medium',
                    skills: ['Physical Work', 'Teamwork']
                })
            });
            
            const taskData = await taskResponse.json();
            if (taskResponse.ok) {
                console.log('✅ Sample task created:', taskData.title);
            } else {
                console.log('❌ Task creation failed:', taskData.error);
            }
            
            console.log('\n🎯 NGO Dashboard Enhancement Plan:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('1. 📊 Enhanced Analytics Dashboard');
            console.log('   - Task completion rates');
            console.log('   - Volunteer engagement metrics');
            console.log('   - Impact visualization charts');
            console.log('');
            console.log('2. 🔍 Advanced Task Management');
            console.log('   - Bulk task operations');
            console.log('   - Task templates for recurring events');
            console.log('   - Advanced filtering and search');
            console.log('');
            console.log('3. 👥 Volunteer Management System');
            console.log('   - Volunteer profiles and history');
            console.log('   - Performance tracking');
            console.log('   - Communication tools');
            console.log('');
            console.log('4. 🎖️ Certificate & Badge System');
            console.log('   - Automated certificate generation');
            console.log('   - Custom badge creation');
            console.log('   - Achievement tracking');
            console.log('');
            console.log('5. 📧 Communication Hub');
            console.log('   - Email templates');
            console.log('   - Automated notifications');
            console.log('   - Announcement system');
            console.log('');
            console.log('6. 📱 Mobile-First Design');
            console.log('   - Responsive dashboard');
            console.log('   - Touch-friendly interface');
            console.log('   - Progressive Web App features');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
        } else {
            console.log('❌ NGO Login failed:', loginData.error);
        }
        
    } catch (error) {
        console.error('❌ Error testing NGO dashboard:', error.message);
    }
}

testNGODashboardAPIs();
