const mongoose = require('mongoose');
require('dotenv').config();

async function fixJoyTest2Task() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get the NGO ID for contact@oceanguardians.org
    const ngo = await db.collection('users').findOne({email: 'contact@oceanguardians.org'});
    console.log('NGO found:', ngo.name, 'ID:', ngo._id.toString());
    
    // Find and fix the joy test 2 task
    const joyTest2 = await db.collection('tasks').findOne({title: 'joy test 2'});
    if (joyTest2) {
      console.log('Found joy test 2 task:');
      console.log('- Current NGO ID:', joyTest2.ngoId);
      console.log('- Date:', joyTest2.date);
      
      // Update the task with correct NGO ID
      const result = await db.collection('tasks').updateOne(
        {_id: joyTest2._id},
        {$set: {ngoId: ngo._id}}
      );
      
      console.log('✅ Updated joy test 2 task with correct NGO ID');
      console.log('- Modified count:', result.modifiedCount);
      
      // Also check if there are any applications for this task that need fixing
      const applications = await db.collection('taskapplications').find({taskId: joyTest2._id}).toArray();
      console.log('\\n📋 Found', applications.length, 'applications for joy test 2:');
      applications.forEach(app => {
        console.log('- Application ID:', app._id, 'Volunteer ID:', app.volunteerId, 'Status:', app.status);
      });
      
    } else {
      console.log('❌ Joy test 2 task not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixJoyTest2Task();
