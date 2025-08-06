const mongoose = require('mongoose');
require('dotenv').config();

async function debugTaskOwnership() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Debugging Task Ownership Issue');
    console.log('=================================');
    
    // Get the test NGO ID from our login
    const testNGOEmail = 'testngo@example.com';
    const testNGO = await db.collection('users').findOne({email: testNGOEmail});
    console.log('Test NGO ID:', testNGO?._id.toString());
    
    // Get the joy test 2 task
    const task = await db.collection('tasks').findOne({title: 'joy test 2'});
    console.log('\\nTask details:');
    console.log('- Title:', task.title);
    console.log('- ngoId:', task.ngoId?.toString());
    console.log('- postedBy:', task.postedBy?.toString());
    
    console.log('\\n🔍 Ownership Analysis:');
    console.log('- Test NGO matches task.ngoId?', testNGO?._id.toString() === task.ngoId?.toString());
    console.log('- Test NGO matches task.postedBy?', testNGO?._id.toString() === task.postedBy?.toString());
    
    // Check if we need to update the task ownership
    if (testNGO && task && testNGO._id.toString() !== task.ngoId?.toString()) {
      console.log('\\n🔧 Fixing task ownership...');
      const updateResult = await db.collection('tasks').updateOne(
        {title: 'joy test 2'},
        {$set: {ngoId: testNGO._id, postedBy: testNGO._id}}
      );
      console.log('Update result:', updateResult);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugTaskOwnership();
