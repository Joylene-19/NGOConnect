const { MongoClient } = require('mongodb');

async function debugTaskAuth() {
  const client = new MongoClient("mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0");
  
  try {
    await client.connect();
    const db = client.db('ngoconnect');
    
    console.log('🔍 Debugging Task Authorization');
    console.log('==============================');
    
    // Get Ocean Guardians NGO
    const ngo = await db.collection('users').findOne({
      email: 'contact@oceanguardians.org'
    });
    console.log('\n🏢 Ocean Guardians NGO:');
    console.log('ID:', ngo._id.toString());
    console.log('Email:', ngo.email);
    console.log('Username:', ngo.username);
    
    // Get the joy test 2 task
    const task = await db.collection('tasks').findOne({
      title: 'joy test 2'
    });
    console.log('\n📋 Joy Test 2 Task:');
    console.log('ID:', task._id.toString());
    console.log('Title:', task.title);
    console.log('ngoId:', task.ngoId);
    console.log('postedBy:', task.postedBy);
    console.log('ngoId type:', typeof task.ngoId);
    console.log('NGO ID type:', typeof ngo._id.toString());
    
    // Check authorization logic
    console.log('\n🔐 Authorization Check:');
    console.log('task.ngoId === ngo._id.toString():', task.ngoId === ngo._id.toString());
    console.log('task.ngoId:', task.ngoId);
    console.log('ngo._id.toString():', ngo._id.toString());
    
    // Check if they're both strings
    console.log('Are both strings?', typeof task.ngoId === 'string' && typeof ngo._id.toString() === 'string');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugTaskAuth();
