const mongoose = require('mongoose');
require('dotenv').config();

async function checkTaskFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Checking task schema fields in database');
    console.log('=========================================');
    
    // Find joy test 2 task and see all its fields
    const task = await db.collection('tasks').findOne({title: 'joy test 2'});
    
    console.log('Task fields:');
    Object.keys(task).forEach(field => {
      console.log(`- ${field}: ${task[field]} (${typeof task[field]})`);
    });
    
    console.log('\\n🔍 Does task have ngoId field?', 'ngoId' in task);
    console.log('🔍 Does task have postedBy field?', 'postedBy' in task);
    
    if (task.ngoId) {
      console.log('✅ Task has ngoId:', task.ngoId.toString());
    }
    
    if (task.postedBy) {
      console.log('✅ Task has postedBy:', task.postedBy.toString());
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTaskFields();
