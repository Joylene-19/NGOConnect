const mongoose = require('mongoose');
require('dotenv').config();

async function debugDateQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    const testNGOId = '6893cb5fa099de16c068d925';
    
    console.log('🔍 Debugging date query for joy test 2...');
    console.log('Test NGO ID:', testNGOId);
    
    // Check the current task
    const task = await db.collection('tasks').findOne({title: 'joy test 2'});
    console.log('Current task:');
    console.log('- Title:', task.title);
    console.log('- NGO ID:', task.ngoId.toString());
    console.log('- Date:', task.date);
    console.log('- Date type:', typeof task.date);
    
    // Test different query approaches for 2025-08-07
    console.log('\\n🧪 Testing different query approaches:');
    
    // Query 1: Exact NGO ID match
    const query1 = await db.collection('tasks').find({
      ngoId: new mongoose.Types.ObjectId(testNGOId)
    }).toArray();
    console.log('Query 1 (NGO ID only):', query1.length, 'results');
    
    // Query 2: Date range for 2025-08-07
    const targetDate = new Date('2025-08-07');
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
    
    console.log('Date range:');
    console.log('- Start of day:', startOfDay);
    console.log('- End of day:', endOfDay);
    console.log('- Task date:', task.date);
    console.log('- Task date in range?', task.date >= startOfDay && task.date <= endOfDay);
    
    const query2 = await db.collection('tasks').find({
      ngoId: new mongoose.Types.ObjectId(testNGOId),
      date: { $gte: startOfDay, $lte: endOfDay }
    }).toArray();
    console.log('Query 2 (NGO ID + date range):', query2.length, 'results');
    
    // Query 3: Without status filter
    const query3 = await db.collection('tasks').find({
      ngoId: new mongoose.Types.ObjectId(testNGOId),
      date: { $gte: startOfDay, $lte: endOfDay }
    }).toArray();
    console.log('Query 3 (NGO ID + date range, no status filter):', query3.length, 'results');
    
    if (query3.length > 0) {
      console.log('Found task with status:', query3[0].status);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDateQuery();
