const { MongoClient, ObjectId } = require('mongodb');

async function createTestApplication() {
  const client = new MongoClient("mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0");
  
  try {
    await client.connect();
    const db = client.db('ngoconnect');
    
    console.log('🔍 Creating Test Application for Joy Test 2');
    console.log('==========================================');
    
    const taskId = '6893b864139fb01e1d62c3ed';
    
    // First, let's find or create a test volunteer
    let volunteer = await db.collection('users').findOne({
      email: 'sarah.johnson@email.com'
    });
    
    if (!volunteer) {
      console.log('📝 Creating test volunteer...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const volunteerData = {
        username: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        password: hashedPassword,
        role: 'volunteer',
        phone: '555-0123',
        location: 'Mumbai, India',
        skills: ['environmental conservation', 'community outreach'],
        availability: 'weekends',
        experience: 'Marine conservation volunteer for 2 years',
        createdAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(volunteerData);
      volunteer = { _id: result.insertedId, ...volunteerData };
      console.log('✅ Created volunteer:', volunteer.email);
    } else {
      console.log('✅ Found existing volunteer:', volunteer.email);
    }
    
    // Create the application
    const applicationData = {
      taskId: taskId,
      volunteerId: volunteer._id.toString(),
      volunteerName: volunteer.username,
      volunteerEmail: volunteer.email,
      status: 'approved', // Directly approve it for testing
      appliedAt: new Date(),
      approvedAt: new Date(),
      message: 'I am passionate about marine conservation and would love to help with this project.'
    };
    
    console.log('📝 Creating application...');
    const result = await db.collection('applications').insertOne(applicationData);
    console.log('✅ Application created with ID:', result.insertedId.toString());
    
    // Verify the application was created
    const application = await db.collection('applications').findOne({
      _id: result.insertedId
    });
    
    console.log('\n📄 Application Details:');
    console.log('ID:', application._id.toString());
    console.log('Task ID:', application.taskId);
    console.log('Volunteer:', application.volunteerName);
    console.log('Email:', application.volunteerEmail);
    console.log('Status:', application.status);
    console.log('Applied At:', application.appliedAt);
    
    console.log('\n✅ Test application created successfully!');
    console.log('🎯 Now the attendance API should return data for this task.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestApplication();
