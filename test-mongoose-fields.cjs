const mongoose = require('mongoose');
require('dotenv').config();

async function testMongooseFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Define the exact same schema as in the server
    const taskSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      requiredSkills: [{
        type: String,
        trim: true
      }],
      date: {
        type: Date,
        required: true
      },
      duration: {
        type: String,
        default: "1 hour"
      },
      hours: {
        type: Number,
        default: 1
      },
      status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
      },
      taskStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
      },
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      appliedVolunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      approvedVolunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      maxVolunteers: {
        type: Number,
        default: 10
      },
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      category: {
        type: String,
        default: 'General'
      },
      completedAt: {
        type: Date,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    });

    const Task = mongoose.model('Task', taskSchema);
    
    console.log('🔍 Testing Mongoose field retrieval');
    console.log('===================================');
    
    const taskId = '6893b864139fb01e1d62c3ed';
    const userId = '6893cb5fa099de16c068d925';
    
    console.log('Looking for task ID:', taskId);
    console.log('User ID to match:', userId);
    
    // Test Mongoose query
    const task = await Task.findById(taskId).lean();
    
    console.log('\\nMongoose query result:');
    console.log('- Task found:', !!task);
    if (task) {
      console.log('- Task title:', task.title);
      console.log('- Task ngoId:', task.ngoId?.toString());
      console.log('- Task postedBy:', task.postedBy?.toString());
      console.log('- ngoId type:', typeof task.ngoId);
      console.log('- postedBy type:', typeof task.postedBy);
      
      console.log('\\nComparison results:');
      console.log('- ngoId === userId:', task.ngoId?.toString() === userId);
      console.log('- postedBy === userId:', task.postedBy?.toString() === userId);
      
      const taskOwnerId = task.ngoId?.toString() || task.postedBy?.toString();
      console.log('- taskOwnerId:', taskOwnerId);
      console.log('- taskOwnerId === userId:', taskOwnerId === userId);
      
      console.log('\\nAll task fields:');
      Object.keys(task).forEach(key => {
        console.log(`  ${key}: ${task[key]} (${typeof task[key]})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMongooseFields();
