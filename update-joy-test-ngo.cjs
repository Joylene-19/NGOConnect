const mongoose = require('mongoose');
require('dotenv').config();

async function updateJoyTestTaskToTestNGO() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    const testNGOId = '6893cb5fa099de16c068d925';
    
    console.log('🔄 Updating joy test 2 task to belong to test NGO...');
    console.log('Test NGO ID:', testNGOId);
    
    // Update the joy test 2 task to belong to our test NGO
    const updateResult = await db.collection('tasks').updateOne(
      { title: 'joy test 2' },
      { $set: { ngoId: new mongoose.Types.ObjectId(testNGOId) } }
    );
    
    console.log('Update result:', updateResult);
    
    if (updateResult.matchedCount > 0) {
      console.log('✅ Successfully updated joy test 2 task to belong to test NGO');
      
      // Verify the update
      const updatedTask = await db.collection('tasks').findOne({title: 'joy test 2'});
      console.log('Updated task NGO ID:', updatedTask.ngoId.toString());
      console.log('Task date:', updatedTask.date);
      
      // Also check if we have any applications for this task
      const applications = await db.collection('taskapplications').find({
        taskId: updatedTask._id
      }).toArray();
      
      console.log(`Found ${applications.length} applications for this task:`);
      applications.forEach((app, index) => {
        console.log(`  ${index + 1}. Status: ${app.status}, Volunteer ID: ${app.volunteerId}`);
      });
      
    } else {
      console.log('❌ No task found with title "joy test 2"');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateJoyTestTaskToTestNGO();
