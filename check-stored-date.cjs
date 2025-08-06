require('dotenv').config();
const mongoose = require('mongoose');

async function checkStoredDate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const TaskModel = mongoose.model('Task', new mongoose.Schema({
      title: String,
      date: Date,
    }));
    
    // Find the most recent debug task
    const task = await TaskModel.findOne({ title: 'Debug Date Task' }).sort({ _id: -1 });
    
    if (task) {
      console.log('Raw date from MongoDB:', task.date);
      console.log('Date toString():', task.date.toString());
      console.log('Date toISOString():', task.date.toISOString());
      console.log('Date getFullYear():', task.date.getFullYear());
      console.log('Date getMonth():', task.date.getMonth());
      console.log('Date getDate():', task.date.getDate());
    } else {
      console.log('No debug task found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStoredDate();
