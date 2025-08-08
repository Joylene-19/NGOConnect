const axios = require('axios');

async function testAutoGeneration() {
  try {
    console.log('🧪 Testing Auto-Certificate Generation...\n');
    
    // Login as NGO first
    const ngoEmail = 'contact@oceanguardians.org';
    const password = 'password123';
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: ngoEmail,
      password: password
    });
    const ngoToken = loginResponse.data.token;
    console.log('✅ NGO login successful');
    
    // Test the update task statuses endpoint to trigger auto-completion
    console.log('\n🔄 Triggering task status updates...');
    try {
      const updateResponse = await axios.post('http://localhost:3001/api/update-task-statuses', {}, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      
      console.log('Update response:', updateResponse.data);
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if any new certificates were generated
      console.log('\n📁 Checking certificates directory...');
      const certificatesResponse = await axios.get('http://localhost:3001/api/certificates/task/6893d67a7d63036a2cac1b34', {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      
      console.log('Certificates for joy test 3:', certificatesResponse.data);
      
    } catch (updateError) {
      console.log('Update task statuses response:', updateError.response?.data || updateError.message);
    }
    
    // Test getting task info to see if it's completed
    console.log('\n📋 Checking task status after update...');
    const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    
    const joyTest3 = tasksResponse.data.find(task => task.title.includes('joy test 3'));
    if (joyTest3) {
      console.log('Joy test 3 status:', {
        title: joyTest3.title,
        status: joyTest3.status,
        completedAt: joyTest3.completedAt
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testAutoGeneration();
