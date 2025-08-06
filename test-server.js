const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Create a simple test server
const app = express();
app.use(express.json());

// Simple task schema
const taskSchema = new mongoose.Schema({
  title: String,
  ngoId: mongoose.Schema.Types.ObjectId,
  postedBy: mongoose.Schema.Types.ObjectId,
}, { collection: 'tasks', strict: false });

const TaskApplication = mongoose.model('TaskApplication', new mongoose.Schema({
  taskId: mongoose.Schema.Types.ObjectId,
  volunteerId: mongoose.Schema.Types.ObjectId,
  status: String
}, { collection: 'taskapplications' }));

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String
}, { collection: 'users' }));

const Task = mongoose.model('Task', taskSchema);

// Test endpoint without authorization
app.get('/test-attendance/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('🧪 Testing task attendance for:', taskId);
    
    // Get the task
    const task = await Task.findById(taskId).lean();
    console.log('Task found:', task ? task.title : 'Not found');
    console.log('Task ngoId:', task?.ngoId?.toString());
    console.log('Task postedBy:', task?.postedBy?.toString());
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get applications
    const applications = await TaskApplication.find({
      taskId: taskId,
      status: 'approved'
    }).populate('volunteerId', 'name email').lean();
    
    console.log('Applications found:', applications.length);
    
    // Format response like frontend expects
    const volunteers = applications.map(app => ({
      volunteerId: app.volunteerId._id,
      volunteerName: app.volunteerId.name,
      volunteerEmail: app.volunteerId.email,
      attendanceStatus: 'pending',
      hoursCompleted: 0,
      markedAt: null,
      attendanceId: null,
      trackingStatus: 'Not Started'
    }));
    
    const response = {
      taskId: task._id,
      taskTitle: task.title,
      taskDate: task.date,
      volunteers
    };
    
    console.log('Response:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startTestServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    app.listen(3002, () => {
      console.log('Test server running on http://localhost:3002');
      console.log('Test URL: http://localhost:3002/test-attendance/6893b864139fb01e1d62c3ed');
    });
  } catch (error) {
    console.error('Failed to start test server:', error);
  }
}

startTestServer();
