const mongoose = require('mongoose');
require('dotenv').config();

async function fixJoyTest2Ownership() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('🔧 Fixing joy test 2 task ownership');
    console.log('==================================');
    
    const oceanGuardiansId = '6867db7a8d444eed1cdcf813';
    
    // Update the task to have correct ngoId
    const updateResult = await db.collection('tasks').updateOne(
      {title: 'joy test 2'},
      {$set: {
        ngoId: new mongoose.Types.ObjectId(oceanGuardiansId)
      }}
    );
    
    console.log('Update result:', updateResult);
    
    // Verify the update
    const updatedTask = await db.collection('tasks').findOne({title: 'joy test 2'});
    console.log('\\n✅ Updated task:');
    console.log('- NGO ID:', updatedTask.ngoId.toString());
    console.log('- Posted By:', updatedTask.postedBy.toString());
    console.log('- Both match Ocean Guardians?', 
      updatedTask.ngoId.toString() === oceanGuardiansId && 
      updatedTask.postedBy.toString() === oceanGuardiansId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixJoyTest2Ownership();
