const mongoose = require('mongoose');
require('dotenv').config();

async function createTestTaskForNGO() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find our NGO
    const ngo = await db.collection('users').findOne({email: 'contact@oceanguardians.org'});
    console.log('NGO found:', ngo.name, 'ID:', ngo._id.toString());
    
    // Create a test task for today + 10 days with this NGO
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 10); // Future date
    const dateString = testDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const testTask = {
      title: 'Attendance Test Task',
      description: 'A test task for testing attendance management',
      location: 'Test Location',
      date: dateString,
      hours: 4,
      status: 'open',
      ngoId: ngo._id,
      appliedVolunteers: [],
      approvedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('tasks').insertOne(testTask);
    console.log('Created test task:', result.insertedId, 'for date:', dateString);
    
    // Also find a volunteer to create an application
    const volunteer = await db.collection('users').findOne({email: 'sarah.johnson@email.com'});
    if (volunteer) {
      console.log('Volunteer found:', volunteer.name, 'ID:', volunteer._id.toString());
      
      // Create an approved application
      const application = {
        taskId: result.insertedId,
        volunteerId: volunteer._id,
        status: 'approved',
        appliedAt: new Date(),
        reviewedAt: new Date()
      };
      
      const appResult = await db.collection('taskapplications').insertOne(application);
      console.log('Created approved application:', appResult.insertedId);
      
      console.log('\\n✅ Test setup complete!');
      console.log('📅 Test date for attendance API:', dateString);
      console.log('🏢 NGO:', ngo.name);
      console.log('👤 Approved volunteer:', volunteer.name);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestTaskForNGO();
