/**
 * Simple debug script to test task creation API
 */

const BASE_URL = 'http://localhost:3001'

async function testTaskCreation() {
  try {
    // First login as NGO
    console.log('🔐 Logging in as NGO...')
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'attendance.ngo@example.com',
        password: 'testpass123'
      })
    })

    if (!loginResponse.ok) {
      throw new Error('Login failed')
    }

    const loginData = await loginResponse.json()
    const token = loginData.token
    console.log('✅ Login successful')

    // Now test task creation with minimal data
    console.log('📋 Testing task creation...')
    
    const minimalTask = {
      title: 'Debug Test Task',
      description: 'Minimal task for debugging',
      location: 'Debug Location',
      requiredSkills: ['debug'],
      date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    }

    console.log('Sending task data:', JSON.stringify(minimalTask, null, 2))

    const taskResponse = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(minimalTask)
    })

    const taskText = await taskResponse.text()
    console.log('Response status:', taskResponse.status)
    console.log('Response text:', taskText)

    if (taskResponse.ok) {
      console.log('✅ Task creation successful')
      const taskData = JSON.parse(taskText)
      return taskData.id // The response has id directly, not nested under task
    } else {
      console.log('❌ Task creation failed')
      try {
        const errorData = JSON.parse(taskText)
        console.log('Error details:', JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.log('Raw error response:', taskText)
      }
      return null
    }

  } catch (error) {
    console.error('Test failed:', error)
    return null
  }
}

testTaskCreation().then(result => {
  console.log('\nTest result:', result ? 'SUCCESS' : 'FAILED')
})
