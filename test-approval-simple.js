/**
 * Simple Test for Application Approval Flow
 * Uses existing data to test the approve/reject functionality
 */

const BASE_URL = 'http://localhost:3001'

async function testApplicationApproval() {
  try {
    // Login as NGO
    console.log('🔐 Logging in as NGO...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'attendance.ngo@example.com',
        password: 'testpass123'
      })
    })

    if (!loginResponse.ok) {
      throw new Error('NGO login failed')
    }

    const { token } = await loginResponse.json()
    console.log('✅ NGO login successful')

    // Get existing tasks
    console.log('📋 Getting NGO tasks...')
    const tasksResponse = await fetch(`${BASE_URL}/api/my-tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!tasksResponse.ok) {
      throw new Error('Failed to get tasks')
    }

    const tasks = await tasksResponse.json()
    console.log(`✅ Found ${tasks.length} tasks`)

    if (tasks.length === 0) {
      console.log('⚠️  No tasks found. Creating a minimal task first...')
      
      const createResponse = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Quick Test Task',
          description: 'Quick test for approval flow',
          location: 'Test Location',
          requiredSkills: ['testing'],
          date: new Date(Date.now() + 86400000).toISOString()
        })
      })

      if (createResponse.ok) {
        const newTask = await createResponse.json()
        console.log('✅ Created new task:', newTask.id)
      } else {
        const error = await createResponse.text()
        console.log('❌ Task creation failed:', error)
      }
    }

    // Get applications for NGO's tasks
    console.log('📝 Getting task applications...')
    const appsResponse = await fetch(`${BASE_URL}/api/my-task-applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!appsResponse.ok) {
      throw new Error('Failed to get applications')
    }

    const applications = await appsResponse.json()
    console.log(`✅ Found ${applications.length} applications`)

    if (applications.length === 0) {
      console.log('⚠️  No applications found to test approval')
      return false
    }

    // Find a pending application
    const pendingApp = applications.find(app => app.status === 'pending')
    
    if (!pendingApp) {
      console.log('⚠️  No pending applications found')
      applications.forEach(app => {
        console.log(`   App ${app.id}: ${app.status}`)
      })
      return false
    }

    console.log(`🎯 Testing approval for application: ${pendingApp.id}`)

    // Test the approve endpoint
    const approveResponse = await fetch(`${BASE_URL}/api/applications/${pendingApp.id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (approveResponse.ok) {
      const result = await approveResponse.json()
      console.log('✅ Application approved successfully!')
      console.log(`   Application ID: ${result.application.id}`)
      console.log(`   Status: ${result.application.status}`)
      return true
    } else {
      const error = await approveResponse.text()
      console.log('❌ Approval failed:', error)
      return false
    }

  } catch (error) {
    console.error('Test failed:', error)
    return false
  }
}

testApplicationApproval().then(success => {
  console.log('\n' + '='.repeat(50))
  console.log(success ? '🎯 APPROVAL TEST: PASSED' : '💥 APPROVAL TEST: FAILED')
  console.log('='.repeat(50))
})
