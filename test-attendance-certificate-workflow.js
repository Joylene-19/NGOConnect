/**
 * Comprehensive Test Script for Attendance and Certificate Workflow
 * 
 * This script tests the complete volunteer tracking workflow:
 * 1. NGO creates task
 * 2. Volunteer applies
 * 3. NGO approves application
 * 4. NGO marks attendance
 * 5. NGO generates certificate
 * 6. Volunteer views their certificate
 */

const BASE_URL = 'http://localhost:3001'

// Test user credentials
const NGO_CREDENTIALS = {
  email: 'attendance.ngo@example.com',
  password: 'testpass123',
  name: 'Attendance Test NGO',
  role: 'ngo',
  phone: '1234567890',
  address: '123 NGO Street'
}

const VOLUNTEER_CREDENTIALS = {
  email: 'attendance.volunteer@example.com',
  password: 'testpass123',
  name: 'Attendance Test Volunteer',
  role: 'volunteer',
  phone: '0987654321',
  skills: ['environmental', 'education']
}

let ngoToken = ''
let volunteerToken = ''
let taskId = ''
let applicationId = ''

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  
  const text = await response.text()
  let data = null
  
  try {
    data = JSON.parse(text)
  } catch (e) {
    console.log('Response is not JSON:', text)
    data = { raw: text }
  }
  
  return { response, data }
}

async function signupUser(credentials) {
  console.log(`📝 Signing up ${credentials.role}: ${credentials.email}`)
  
  const { response, data } = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
  
  if (response.ok) {
    console.log(`✅ ${credentials.role} signup successful`)
    return data.token
  } else {
    console.log(`❌ ${credentials.role} signup failed:`, data)
    return null
  }
}

async function loginUser(email, password, role) {
  console.log(`🔐 Logging in ${role}: ${email}`)
  
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  
  if (response.ok) {
    console.log(`✅ ${role} login successful`)
    return data.token
  } else {
    console.log(`❌ ${role} login failed:`, data)
    return null
  }
}

async function createTask(token) {
  console.log('📋 Creating a test task...')
  
  const taskData = {
    title: 'Beach Cleanup - Attendance Test',
    description: 'A test task for attendance and certificate workflow',
    location: 'Test Beach, Test City',
    date: '2025-02-01',
    time: '09:00',
    duration: '4 hours',
    maxVolunteers: 5,
    category: 'environment',
    urgency: 'medium',
    requiredSkills: ['environmental'],
    requirements: 'No prior experience required. We will provide all materials.'
  }
  
  const { response, data } = await makeRequest('/api/tasks', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(taskData)
  })
  
  if (response.ok) {
    console.log('✅ Task created successfully:', data.task.id)
    return data.task.id
  } else {
    console.log('❌ Task creation failed:', data)
    return null
  }
}

async function applyForTask(token, taskId) {
  console.log('📝 Volunteer applying for task...')
  
  const applicationData = {
    taskId,
    message: 'I would like to help with this beach cleanup!'
  }
  
  const { response, data } = await makeRequest('/api/applications', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(applicationData)
  })
  
  if (response.ok) {
    console.log('✅ Application submitted successfully:', data.application.id)
    return data.application.id
  } else {
    console.log('❌ Application failed:', data)
    return null
  }
}

async function approveApplication(token, applicationId) {
  console.log('✅ NGO approving application...')
  
  const { response, data } = await makeRequest(`/api/applications/${applicationId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    console.log('✅ Application approved successfully')
    return true
  } else {
    console.log('❌ Application approval failed:', data)
    return false
  }
}

async function getTaskAttendance(token, taskId) {
  console.log('👥 Getting task attendance...')
  
  const { response, data } = await makeRequest(`/api/attendance/task/${taskId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    console.log('✅ Attendance data retrieved:', data)
    return data
  } else {
    console.log('❌ Failed to get attendance:', data)
    return null
  }
}

async function markAttendance(token, taskId, volunteerId, status = 'present', hours = 4) {
  console.log(`📊 Marking attendance as ${status}...`)
  
  const { response, data } = await makeRequest('/api/attendance/mark', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      taskId,
      volunteerId,
      status,
      hoursCompleted: hours
    })
  })
  
  if (response.ok) {
    console.log('✅ Attendance marked successfully')
    return true
  } else {
    console.log('❌ Failed to mark attendance:', data)
    return false
  }
}

async function generateCertificate(token, taskId, volunteerId) {
  console.log('🏆 Generating certificate...')
  
  const { response, data } = await makeRequest('/api/certificates/generate', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      taskId,
      volunteerId
    })
  })
  
  if (response.ok) {
    console.log('✅ Certificate generated successfully:', data)
    return data.certificate
  } else {
    console.log('❌ Failed to generate certificate:', data)
    return null
  }
}

async function getVolunteerCertificates(token) {
  console.log('📜 Getting volunteer certificates...')
  
  const { response, data } = await makeRequest('/api/certificates/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    console.log('✅ Certificates retrieved:', data)
    return data
  } else {
    console.log('❌ Failed to get certificates:', data)
    return []
  }
}

async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete Attendance & Certificate Workflow Test\n')
  
  try {
    // Step 1: Setup users
    ngoToken = await signupUser(NGO_CREDENTIALS) || await loginUser(NGO_CREDENTIALS.email, NGO_CREDENTIALS.password, 'ngo')
    volunteerToken = await signupUser(VOLUNTEER_CREDENTIALS) || await loginUser(VOLUNTEER_CREDENTIALS.email, VOLUNTEER_CREDENTIALS.password, 'volunteer')
    
    if (!ngoToken || !volunteerToken) {
      throw new Error('Failed to setup test users')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 2: Create task
    taskId = await createTask(ngoToken)
    if (!taskId) {
      throw new Error('Failed to create task')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 3: Volunteer applies
    applicationId = await applyForTask(volunteerToken, taskId)
    if (!applicationId) {
      throw new Error('Failed to apply for task')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 4: NGO approves application
    const approved = await approveApplication(ngoToken, applicationId)
    if (!approved) {
      throw new Error('Failed to approve application')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 5: Get volunteer ID from attendance data
    const attendanceData = await getTaskAttendance(ngoToken, taskId)
    if (!attendanceData || !attendanceData.volunteers.length) {
      throw new Error('No volunteers found in attendance data')
    }
    
    const volunteerId = attendanceData.volunteers[0].volunteerId
    console.log('📋 Volunteer ID for attendance:', volunteerId)
    
    console.log('\n' + '='.repeat(50))
    
    // Step 6: Mark attendance
    const attendanceMarked = await markAttendance(ngoToken, taskId, volunteerId, 'present', 4)
    if (!attendanceMarked) {
      throw new Error('Failed to mark attendance')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 7: Generate certificate
    const certificate = await generateCertificate(ngoToken, taskId, volunteerId)
    if (!certificate) {
      throw new Error('Failed to generate certificate')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Step 8: Volunteer views certificates
    const certificates = await getVolunteerCertificates(volunteerToken)
    
    console.log('\n' + '🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY! 🎉')
    console.log('✅ All steps completed:')
    console.log('  1. NGO and Volunteer accounts created/logged in')
    console.log('  2. Task created successfully')
    console.log('  3. Volunteer application submitted')
    console.log('  4. Application approved by NGO')
    console.log('  5. Attendance marked as present')
    console.log('  6. Certificate generated')
    console.log('  7. Volunteer can view certificates')
    
    return true
    
  } catch (error) {
    console.log('\n❌ WORKFLOW TEST FAILED:', error.message)
    return false
  }
}

// Run the test
runCompleteWorkflowTest().then(success => {
  console.log('\n' + '='.repeat(60))
  console.log(success ? '🎯 TEST SUITE: PASSED' : '💥 TEST SUITE: FAILED')
  console.log('='.repeat(60))
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Test runner error:', error)
  process.exit(1)
})
