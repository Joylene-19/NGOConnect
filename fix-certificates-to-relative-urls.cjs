const { MongoClient } = require('mongodb');

async function fixCertificateUrlsToRelative() {
  const client = new MongoClient('mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ngoconnect');
    
    // Find all certificates with absolute URLs
    const certificatesWithAbsoluteUrls = await db.collection('certificates').find({
      certificateUrl: { $regex: '^http://localhost:3001/api/certificates/download/' }
    }).toArray();
    
    console.log(`Found ${certificatesWithAbsoluteUrls.length} certificates with absolute URLs`);
    
    for (const cert of certificatesWithAbsoluteUrls) {
      // Convert from http://localhost:3001/api/certificates/download/filename.pdf to /api/certificates/download/filename.pdf
      const newUrl = cert.certificateUrl.replace('http://localhost:3001', '');
      console.log(`Updating certificate ${cert._id}: ${cert.certificateUrl} -> ${newUrl}`);
      
      await db.collection('certificates').updateOne(
        { _id: cert._id },
        { $set: { certificateUrl: newUrl } }
      );
    }
    
    console.log('✅ All certificate URLs updated to relative URLs');
    
    // Verify the updates
    const allCertificates = await db.collection('certificates').find({}).toArray();
    console.log('\n--- Verification ---');
    allCertificates.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}: certificateUrl=${cert.certificateUrl}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixCertificateUrlsToRelative();
