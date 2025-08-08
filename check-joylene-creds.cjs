const { MongoClient } = require('mongodb');

async function checkJoyleneCredentials() {
  const client = new MongoClient('mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ngoconnect');
    
    // Find joylene's user
    const user = await db.collection('users').findOne({ email: 'joylene19072005@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:');
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  ID:', user._id.toString());
    console.log('  Has password field:', !!user.password);
    console.log('  Password length:', user.password ? user.password.length : 'N/A');
    console.log('  Role:', user.role);
    console.log('  Username:', user.username);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkJoyleneCredentials();
