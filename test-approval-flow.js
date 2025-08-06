import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

// Test credentials
const ngoAuth = {
  email: 'contact@oceanguardians.org',
  password: 'password'
};

const volunteerAuth = {
  email: 'sarah.johnson@email.com', 
  password: 'password'
};

async function testApprovalFlow() {
  try {
    console.log('🧪 Testing Application Approval Flow\n');

    // 1. Get NGO token
    console.log('1. Logging in as NGO...');
    const ngoLogin = await axios.post(`${BASE_URL}/api/login`, ngoAuth);
    const ngoToken = ngoLogin.data.token;
    console.log('✅ NGO logged in successfully');

    // 2. Get volunteer token
    console.log('2. Logging in as Volunteer...');
    const volunteerLogin = await axios.post(`${BASE_URL}/api/login`, volunteerAuth);
    const volunteerToken = volunteerLogin.data.token;
    console.log('✅ Volunteer logged in successfully');

    // 3. Check volunteer's current applications
    console.log('3. Checking volunteer applications before approval...');
    const beforeApproval = await axios.get(`${BASE_URL}/api/my-applications`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    console.log(`📊 Volunteer has ${beforeApproval.data.length} applications`);
    
    if (beforeApproval.data.length > 0) {
      const app = beforeApproval.data[0];
      console.log(`   - Application ID: ${app.id}`);
      console.log(`   - Status: ${app.status}`);
      console.log(`   - Task: ${app.task?.title || 'N/A'}`);
    }

    // 4. Check NGO's task applications
    console.log('4. Checking NGO task applications...');
    const ngoApps = await axios.get(`${BASE_URL}/api/my-task-applications`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    console.log(`📊 NGO has ${ngoApps.data.length} applications to review`);

    if (ngoApps.data.length > 0) {
      const pendingApp = ngoApps.data.find(app => app.status === 'pending');
      
      if (pendingApp) {
        console.log(`\n5. Approving application ${pendingApp.id}...`);
        
        // Approve the application
        const approveResponse = await axios.put(
          `${BASE_URL}/api/applications/${pendingApp.id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${ngoToken}` } }
        );
        
        console.log(`✅ Application approved! Response:`, approveResponse.data);

        // 6. Wait a moment for data to sync
        console.log('\n6. Waiting 2 seconds for data sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 7. Check volunteer applications after approval
        console.log('7. Checking volunteer applications after approval...');
        const afterApproval = await axios.get(`${BASE_URL}/api/my-applications`, {
          headers: { Authorization: `Bearer ${volunteerToken}` }
        });
        
        console.log(`📊 Volunteer now has ${afterApproval.data.length} applications`);
        const approvedApp = afterApproval.data.find(app => app.id === pendingApp.id);
        
        if (approvedApp) {
          console.log(`   - Updated Status: ${approvedApp.status}`);
          console.log(`   - Task Start: ${approvedApp.task?.startDate}`);
          console.log(`   - Task End: ${approvedApp.task?.endDate}`);
          
          // Calculate expected status based on dates
          const now = new Date();
          const startDate = new Date(approvedApp.task?.startDate);
          const endDate = new Date(approvedApp.task?.endDate);
          
          let expectedStatus = 'completed';
          if (now < startDate) {
            expectedStatus = 'upcoming';
          } else if (now >= startDate && now <= endDate) {
            expectedStatus = 'in-progress';
          }
          
          console.log(`   - Expected tracking status: ${expectedStatus}`);
          
          if (approvedApp.status === 'approved') {
            console.log('✅ Application status correctly updated to "approved"');
          } else {
            console.log(`❌ Expected status "approved", got "${approvedApp.status}"`);
          }
        } else {
          console.log('❌ Could not find the approved application in volunteer data');
        }

      } else {
        console.log('⚠️  No pending applications found to approve');
      }
    } else {
      console.log('⚠️  No applications found for NGO to review');
    }

    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testApprovalFlow();
