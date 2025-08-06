const { MongoClient, ObjectId } = require('mongodb');

async function checkApplications() {
  const client = new MongoClient("mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0");
  
  try {
    await client.connect();
    const db = client.db('ngoconnect');
    
    console.log('🔍 Checking Applications for Joy Test 2');
    console.log('=====================================');
    
    const taskId = '6893b864139fb01e1d62c3ed';
    
    // Get all applications for this task
    const applications = await db.collection('applications').find({
      taskId: taskId
    }).toArray();
    
    console.log(`\n📄 Found ${applications.length} applications for task ${taskId}`);
    
    applications.forEach((app, index) => {
      console.log(`\nApplication ${index + 1}:`);
      console.log('ID:', app._id.toString());
      console.log('Volunteer ID:', app.volunteerId);
      console.log('Volunteer Name:', app.volunteerName);
      console.log('Volunteer Email:', app.volunteerEmail);
      console.log('Status:', app.status);
      console.log('Applied At:', app.appliedAt);
    });
    
    // Count by status
    const statusCounts = applications.reduce((counts, app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
      return counts;
    }, {});
    
    console.log('\n📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
    // Also check if there are any attendance records
    const attendanceRecords = await db.collection('attendance').find({
      taskId: taskId
    }).toArray();
    
    console.log(`\n📋 Found ${attendanceRecords.length} attendance records for this task`);
    attendanceRecords.forEach((record, index) => {
      console.log(`\nAttendance ${index + 1}:`);
      console.log('ID:', record._id.toString());
      console.log('Volunteer ID:', record.volunteerId);
      console.log('Status:', record.status);
      console.log('Hours Completed:', record.hoursCompleted);
      console.log('Marked At:', record.markedAt);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkApplications();
