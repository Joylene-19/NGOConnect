const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function checkTask() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const { Task, User, Attendance } = require('./server/models');
    
    // Find the 'joy test 3' task
    const task = await Task.findOne({ title: { $regex: /joy test 3/i } }).populate('createdBy');
    
    if (task) {
      console.log('\n📋 Found task:');
      console.log('  ID:', task._id);
      console.log('  Title:', task.title);
      console.log('  Status:', task.status);
      console.log('  Created by:', task.createdBy?.name);
      console.log('  Date:', task.date);
      
      // Check attendance records for this task
      const attendances = await Attendance.find({ taskId: task._id }).populate('volunteerId');
      console.log('\n👥 Attendance records:');
      attendances.forEach(att => {
        console.log(`  - ${att.volunteerId?.name}: ${att.status}`);
      });
      
      // Check if any certificates exist for this task
      const { Certificate } = require('./server/models');
      const certificates = await Certificate.find({ taskId: task._id }).populate('volunteerId');
      console.log('\n🏆 Certificates:');
      if (certificates.length > 0) {
        certificates.forEach(cert => {
          console.log(`  - ${cert.volunteerId?.name}: ${cert.status} (${cert.certificateUrl})`);
        });
      } else {
        console.log('  No certificates found');
      }
      
    } else {
      console.log('❌ Task not found');
      
      // Let's see what tasks exist
      const allTasks = await Task.find({}).select('title status').limit(10);
      console.log('\n📝 Available tasks:');
      allTasks.forEach(t => {
        console.log(`  - ${t.title} (${t.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkTask();
