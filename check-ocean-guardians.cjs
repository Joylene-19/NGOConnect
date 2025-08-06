const mongoose = require('mongoose');
require('dotenv').config();

async function checkOceanGuardiansNGO() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Checking Ocean Guardians NGO and joy test 2 task');
    console.log('=================================================');
    
    // Find the Ocean Guardians NGO
    const oceanGuardians = await db.collection('users').findOne({email: 'contact@oceanguardians.org'});
    console.log('Ocean Guardians NGO:');
    console.log('- Email:', oceanGuardians?.email);
    console.log('- Name:', oceanGuardians?.name);
    console.log('- ID:', oceanGuardians?._id.toString());
    console.log('- Role:', oceanGuardians?.role);
    
    // Find the joy test 2 task
    const joyTest2 = await db.collection('tasks').findOne({title: 'joy test 2'});
    console.log('\\nJoy test 2 task:');
    console.log('- Title:', joyTest2?.title);
    console.log('- NGO ID:', joyTest2?.ngoId?.toString());
    console.log('- Posted By:', joyTest2?.postedBy?.toString());
    console.log('- Date:', joyTest2?.date);
    
    // Check if they match
    console.log('\\n🔍 Ownership Analysis:');
    if (oceanGuardians && joyTest2) {
      const ngoMatches = oceanGuardians._id.toString() === joyTest2.ngoId?.toString();
      const postedByMatches = oceanGuardians._id.toString() === joyTest2.postedBy?.toString();
      
      console.log('- NGO ID matches task.ngoId:', ngoMatches);
      console.log('- NGO ID matches task.postedBy:', postedByMatches);
      
      if (!ngoMatches && !postedByMatches) {
        console.log('\\n🔧 FIXING: Updating task to belong to Ocean Guardians...');
        const updateResult = await db.collection('tasks').updateOne(
          {title: 'joy test 2'},
          {$set: {
            ngoId: oceanGuardians._id,
            postedBy: oceanGuardians._id
          }}
        );
        console.log('Update result:', updateResult);
      }
    }
    
    // Check applications for this task
    if (joyTest2) {
      const applications = await db.collection('taskapplications').find({
        taskId: joyTest2._id,
        status: 'approved'
      }).toArray();
      
      console.log('\\n📋 Approved Applications:');
      console.log('- Count:', applications.length);
      
      for (const app of applications) {
        const volunteer = await db.collection('users').findOne({_id: app.volunteerId});
        console.log(`  - ${volunteer?.name} (${volunteer?.email})`);
        console.log(`    Application ID: ${app._id}`);
        console.log(`    Status: ${app.status}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOceanGuardiansNGO();
