import fetch from 'node-fetch';

async function testNGODashboard() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('🚀 Testing NGO Dashboard Enhancement Readiness...\n');
    
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
            console.log('✅ NGO Login successful:', loginData.user.organizationName);
            
            const token = loginData.token;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Test dashboard data endpoints
            console.log('\n2. Testing Dashboard Data Endpoints...');
            
            // Check tasks
            const tasksResponse = await fetch(`${baseUrl}/api/tasks/my-tasks`, { headers });
            const tasksData = await tasksResponse.json();
            console.log('✅ Tasks endpoint:', tasksData.tasks?.length || 0, 'tasks found');
            
            // Check applications
            const appsResponse = await fetch(`${baseUrl}/api/applications/ngo-applications`, { headers });
            const appsData = await appsResponse.json();
            console.log('✅ Applications endpoint:', appsData.applications?.length || 0, 'applications found');
            
            // Check dashboard stats
            const statsResponse = await fetch(`${baseUrl}/api/dashboard/ngo-stats`, { headers });
            const statsData = await statsResponse.json();
            console.log('✅ Dashboard stats:', JSON.stringify(statsData, null, 2));
            
            // Check reviews
            const reviewsResponse = await fetch(`${baseUrl}/api/reviews/ngo-reviews`, { headers });
            const reviewsData = await reviewsResponse.json();
            console.log('✅ Reviews endpoint:', reviewsData.reviews?.length || 0, 'reviews found');
            
            console.log('\n🎯 NGO Dashboard Enhancement Opportunities:');
            console.log('1. ✨ Enhanced Analytics & Reporting');
            console.log('2. 🔍 Advanced Task Management');
            console.log('3. 📊 Volunteer Performance Tracking');
            console.log('4. 🎖️ Certificate Generation System');
            console.log('5. 📧 Automated Notifications');
            console.log('6. 📱 Mobile-Responsive Design');
            console.log('7. 🎨 Modern UI/UX Improvements');
            
        } else {
            console.log('❌ NGO Login failed:', loginData.error);
        }
        
    } catch (error) {
        console.error('❌ Error testing NGO dashboard:', error.message);
    }
}

testNGODashboard();
