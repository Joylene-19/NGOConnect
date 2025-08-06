const mongoose = require('mongoose');
require('dotenv').config();

async function debugMongooseQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    const testNGOId = '6893cb5fa099de16c068d925';
    
    console.log('🔍 Debugging Mongoose vs Direct MongoDB query');
    console.log('=============================================');
    
    // Check task using direct MongoDB
    console.log('\\n1. Direct MongoDB query:');
    const directQuery = await db.collection('tasks').findOne({title: 'joy test 2'});
    console.log('- Task NGO ID (actual):', directQuery.ngoId.toString());
    console.log('- Test NGO ID:', testNGOId);
    console.log('- NGO IDs match:', directQuery.ngoId.toString() === testNGOId);
    
    // Check if NGO ID was properly updated
    const directQueryWithNGO = await db.collection('tasks').find({
      ngoId: new mongoose.Types.ObjectId(testNGOId)
    }).toArray();
    console.log('- Direct query with NGO ID:', directQueryWithNGO.length, 'results');
    
    // Check with Mongoose Task model
    console.log('\\n2. Mongoose Task model query:');
    
    // First, let me check what the Task model looks like
    console.log('- Available collections:', await mongoose.connection.db.listCollections().toArray().then(cols => cols.map(c => c.name)));
    
    // Try to create a basic Task schema
    const TaskSchema = new mongoose.Schema({
      title: String,
      description: String,
      ngoId: mongoose.Schema.Types.ObjectId,
      date: Date,
      status: String,
      location: String,
      hours: Number,
      appliedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      approvedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }, { collection: 'tasks' });
    
    const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
    
    // Try Mongoose query
    const mongooseQuery = await Task.find({
      ngoId: testNGOId
    }).lean();
    console.log('- Mongoose query with string NGO ID:', mongooseQuery.length, 'results');
    
    const mongooseQueryObjectId = await Task.find({
      ngoId: new mongoose.Types.ObjectId(testNGOId)
    }).lean();
    console.log('- Mongoose query with ObjectId NGO ID:', mongooseQueryObjectId.length, 'results');
    
    // Test the exact query from the API
    const targetDate = new Date('2025-08-07');
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
    
    console.log('\\n3. Full API query simulation:');
    console.log('- Start of day:', startOfDay);
    console.log('- End of day:', endOfDay);
    
    const apiQuery = await Task.find({
      ngoId: testNGOId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'closed' }
    }).lean();
    console.log('- API query results:', apiQuery.length);
    
    if (apiQuery.length > 0) {
      console.log('- Found task:', apiQuery[0].title);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugMongooseQuery();
