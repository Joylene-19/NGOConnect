const { MongoClient, ObjectId } = require('mongodb');

async function convertVolunteerIdsToObjectId() {
  const client = new MongoClient('mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ngoconnect');
    
    // Find all certificates with string volunteer IDs
    const certificatesWithStringIds = await db.collection('certificates').find({
      volunteerId: { $type: 'string' }
    }).toArray();
    
    console.log(`Found ${certificatesWithStringIds.length} certificates with string volunteer IDs`);
    
    for (const cert of certificatesWithStringIds) {
      const objectIdVolunteerId = new ObjectId(cert.volunteerId);
      console.log(`Converting certificate ${cert._id}: "${cert.volunteerId}" -> ObjectId("${cert.volunteerId}")`);
      
      await db.collection('certificates').updateOne(
        { _id: cert._id },
        { $set: { volunteerId: objectIdVolunteerId } }
      );
    }
    
    console.log('✅ All volunteer IDs converted back to ObjectIds');
    
    // Verify the conversion
    const allCertificates = await db.collection('certificates').find({}).toArray();
    console.log('\n--- Verification ---');
    allCertificates.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}: volunteerId=${cert.volunteerId} (type: ${typeof cert.volunteerId})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

convertVolunteerIdsToObjectId();
