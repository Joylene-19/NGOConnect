const { MongoClient, ObjectId } = require('mongodb');

async function fixCertificateUrls() {
  const client = new MongoClient('mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ngoconnect');
    
    // Find all certificates with relative URLs
    const certificatesWithRelativeUrls = await db.collection('certificates').find({
      certificateUrl: { $regex: '^/api/certificates/download/' }
    }).toArray();
    
    console.log(`Found ${certificatesWithRelativeUrls.length} certificates with relative URLs`);
    
    for (const cert of certificatesWithRelativeUrls) {
      const newUrl = `http://localhost:3001${cert.certificateUrl}`;
      console.log(`Updating certificate ${cert._id}: ${cert.certificateUrl} -> ${newUrl}`);
      
      await db.collection('certificates').updateOne(
        { _id: cert._id },
        { $set: { certificateUrl: newUrl } }
      );
    }
    
    console.log('✅ All certificate URLs updated to absolute URLs');
    
    // Also fix volunteer IDs to be strings for consistency
    const certificatesWithObjectIdVolunteers = await db.collection('certificates').find({
      volunteerId: { $type: 'objectId' }
    }).toArray();
    
    console.log(`Found ${certificatesWithObjectIdVolunteers.length} certificates with ObjectId volunteerIds`);
    
    for (const cert of certificatesWithObjectIdVolunteers) {
      const newVolunteerId = cert.volunteerId.toString();
      console.log(`Converting volunteerId ${cert.volunteerId} -> ${newVolunteerId}`);
      
      await db.collection('certificates').updateOne(
        { _id: cert._id },
        { $set: { volunteerId: newVolunteerId } }
      );
    }
    
    console.log('✅ All volunteer IDs converted to strings');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixCertificateUrls();
