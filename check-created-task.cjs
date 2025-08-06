const mongoose = require('mongoose');
require('dotenv').config();

async function checkCreatedTask() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Check our newly created task
    const testTask = await db.collection('tasks').findOne({title: 'Attendance Test Task'});
    console.log('Test task found:');
    console.log('- Title:', testTask.title);
    console.log('- Date:', testTask.date);
    console.log('- NGO ID:', testTask.ngoId);
    console.log('- NGO ID type:', typeof testTask.ngoId);
    console.log('- Status:', testTask.status);
    
    // Check the NGO ID format
    const ngo = await db.collection('users').findOne({email: 'contact@oceanguardians.org'});
    console.log('\\nNGO:');
    console.log('- NGO ID from query:', ngo._id);
    console.log('- NGO ID type:', typeof ngo._id);
    console.log('- Are they equal?', testTask.ngoId.toString() === ngo._id.toString());
    
    // Try the same query that the API is using
    const apiQuery = {
      ngoId: ngo._id,
      date: '2025-08-16',
      status: { $ne: 'closed' }
    };
    
    console.log('\\nAPI Query:', JSON.stringify(apiQuery, null, 2));
    
    const apiResult = await db.collection('tasks').find(apiQuery).toArray();
    console.log('API Query Result:', apiResult.length, 'tasks found');
    
    if (apiResult.length === 0) {
      // Let's try without the status filter
      const simpleQuery = {
        ngoId: ngo._id,
        date: '2025-08-16'
      };
      const simpleResult = await db.collection('tasks').find(simpleQuery).toArray();
      console.log('Simple Query Result:', simpleResult.length, 'tasks found');
      
      // Let's try with string ngoId
      const stringQuery = {
        ngoId: ngo._id.toString(),
        date: '2025-08-16'
      };
      const stringResult = await db.collection('tasks').find(stringQuery).toArray();
      console.log('String NGO ID Query Result:', stringResult.length, 'tasks found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCreatedTask();
