const mongoose = require('mongoose');
require('dotenv').config();

async function checkJoyTest2Date() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find joy test 2 task
    const joyTest2 = await db.collection('tasks').findOne({title: 'joy test 2'});
    if (joyTest2) {
      console.log('Joy test 2 task details:');
      console.log('- Title:', joyTest2.title);
      console.log('- Date (raw):', joyTest2.date);
      console.log('- Date type:', typeof joyTest2.date);
      console.log('- NGO ID:', joyTest2.ngoId);
      
      if (joyTest2.date instanceof Date) {
        console.log('- Date as ISO string:', joyTest2.date.toISOString());
        console.log('- Date as local date:', joyTest2.date.toLocaleDateString());
        console.log('- Date as YYYY-MM-DD:', joyTest2.date.toISOString().split('T')[0]);
      }
      
      // Try to find the task using different date formats
      console.log('\\n🔍 Trying different query formats:');
      
      // Query 1: Exact date object
      const query1 = await db.collection('tasks').find({
        title: 'joy test 2',
        ngoId: joyTest2.ngoId
      }).toArray();
      console.log('Query 1 (basic):', query1.length, 'results');
      
      // Query 2: Date as string
      const query2 = await db.collection('tasks').find({
        title: 'joy test 2',
        ngoId: joyTest2.ngoId,
        date: '2025-08-07'
      }).toArray();
      console.log('Query 2 (date as string 2025-08-07):', query2.length, 'results');
      
      // Query 3: Date range
      const startOfDay = new Date('2025-08-07T00:00:00.000Z');
      const endOfDay = new Date('2025-08-07T23:59:59.999Z');
      const query3 = await db.collection('tasks').find({
        title: 'joy test 2',
        ngoId: joyTest2.ngoId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }).toArray();
      console.log('Query 3 (date range for 2025-08-07):', query3.length, 'results');
      
    } else {
      console.log('❌ Joy test 2 task not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkJoyTest2Date();
