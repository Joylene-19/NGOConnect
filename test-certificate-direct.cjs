const { MongoClient, ObjectId } = require('mongodb');

async function testCertificateDownloadDirect() {
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
    
    // Find ALL certificates 
    const allCertificates = await db.collection('certificates').find({}).toArray();
    console.log(`\nTotal certificates in database: ${allCertificates.length}`);
    
    allCertificates.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}:`);
      console.log('  ID:', cert._id.toString());
      console.log('  VolunteerID:', cert.volunteerId);
      console.log('  Certificate URL:', cert.certificateUrl);
      console.log('  Status:', cert.status);
      console.log('');
    });
    
    // Find certificates specifically for joylene (try both string and ObjectId)
    console.log('\n--- Looking for Joylene certificates ---');
    const joyleneCertsString = await db.collection('certificates').find({ volunteerId: user._id.toString() }).toArray();
    const joyleneCertsObjectId = await db.collection('certificates').find({ volunteerId: user._id }).toArray();
    
    console.log('Found with string ID:', joyleneCertsString.length);
    console.log('Found with ObjectId:', joyleneCertsObjectId.length);
    
    // Test with a certificate directly if any exist
    if (allCertificates.length > 0) {
      console.log('\n--- Testing Download URL with first certificate ---');
      const testCert = allCertificates[0];
      console.log('Testing certificate:', testCert._id.toString());
      console.log('Certificate URL:', testCert.certificateUrl);
      
      if (testCert.certificateUrl) {
        try {
          const fetch = (await import('node-fetch')).default;
          const downloadResponse = await fetch(testCert.certificateUrl);
          console.log('Download Response Status:', downloadResponse.status);
          console.log('Download Response Headers:', Object.fromEntries(downloadResponse.headers.entries()));
          
          if (downloadResponse.ok) {
            console.log('✅ Download URL is working!');
          } else {
            const errorText = await downloadResponse.text();
            console.log('❌ Download URL failed:', errorText);
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testCertificateDownloadDirect();
