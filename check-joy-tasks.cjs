const mongoose = require('mongoose');
require('dotenv').config();

async function checkJoyTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find joy test tasks
    const joyTasks = await db.collection('tasks').find({title: {$regex: 'joy', $options: 'i'}}).toArray();
    console.log('Joy test tasks:', joyTasks.length);
    
    for (const task of joyTasks) {
      console.log('- Task:', task.title, 'Date:', task.date, 'NGO ID:', task.ngoId);
      
      // Find the NGO that created this task
      const ngo = await db.collection('users').findOne({_id: task.ngoId});
      if (ngo) {
        console.log('  Created by NGO:', ngo.name, 'Email:', ngo.email);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkJoyTasks();
