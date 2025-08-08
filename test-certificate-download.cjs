const { MongoClient } = require('mongodb');

async function testCertificateDownload() {
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
    
    console.log('Found user:', user.name, user._id.toString());
    
    // Find certificates for this user
    const certificates = await db.collection('certificates').aggregate([
      { $match: { volunteerId: user._id.toString() } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task'
        }
      }
    ]).toArray();
    
    console.log(`Found ${certificates.length} certificates:`);
    
    certificates.forEach((cert, index) => {
      console.log(`\nCertificate ${index + 1}:`);
      console.log('  ID:', cert._id.toString());
      console.log('  Certificate Number:', cert.certificateNumber);
      console.log('  Certificate URL:', cert.certificateUrl);
      console.log('  Status:', cert.status);
      if (cert.task && cert.task[0]) {
        console.log('  Task:', cert.task[0].title);
      }
    });
    
    // Test the backend API to get certificates
    console.log('\n--- Testing Backend API ---');
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(`http://localhost:3001/api/certificates/volunteer/${user._id.toString()}`);
      const apiCertificates = await response.json();
      
      console.log('API Response Status:', response.status);
      console.log('API Response:', JSON.stringify(apiCertificates, null, 2));
      
      if (apiCertificates.length > 0) {
        console.log('\n--- Testing Download URL ---');
        const firstCert = apiCertificates[0];
        console.log('Testing download for certificate:', firstCert.id);
        console.log('Certificate URL:', firstCert.certificateUrl);
        console.log('URL field:', firstCert.url);
        
        // Test the download endpoint
        if (firstCert.certificateUrl) {
          const downloadResponse = await fetch(firstCert.certificateUrl);
          console.log('Download Response Status:', downloadResponse.status);
          console.log('Download Response Headers:', Object.fromEntries(downloadResponse.headers.entries()));
          
          if (downloadResponse.ok) {
            console.log('✅ Download URL is working!');
          } else {
            console.log('❌ Download URL failed:', await downloadResponse.text());
          }
        }
      }
      
    } catch (apiError) {
      console.error('API Error:', apiError.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testCertificateDownload();
