import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean,
  ngoid: String
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  requiredVolunteers: Number,
  currentVolunteers: Number,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
});

const applicationSchema = new mongoose.Schema({
  userId: String,
  taskId: String,
  status: String,
  appliedAt: Date,
  processedAt: Date
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Application = mongoose.model('Application', applicationSchema);

async function checkCurrentData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).limit(5);
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    const tasks = await Task.find({}).limit(3);
    console.log('\n📋 Tasks in database:');
    tasks.forEach(task => {
      console.log(`   - ${task.title} (${task.startDate?.toDateString()} - ${task.endDate?.toDateString()})`);
    });

    const applications = await Application.find({}).limit(5);
    console.log('\n📄 Applications in database:');
    applications.forEach(app => {
      console.log(`   - User: ${app.userId}, Task: ${app.taskId}, Status: ${app.status}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCurrentData();
