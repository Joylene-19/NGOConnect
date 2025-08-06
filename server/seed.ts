import mongoose from 'mongoose';
import { User, Task } from './models';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://admin:Joylene123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create NGO user
    const ngoUser = await User.create({
      name: 'Ocean Guardians NGO',
      email: 'contact@oceanguardians.org',
      password: hashedPassword,
      role: 'ngo'
    });

    const ngoUser2 = await User.create({
      name: 'Community Food Bank',
      email: 'info@communityfoodbank.org',
      password: hashedPassword,
      role: 'ngo'
    });

    // Create volunteer user
    const volunteerUser = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      password: hashedPassword,
      role: 'volunteer'
    });

    console.log('Created sample users');

    // Create sample tasks
    const tasks = [
      {
        title: 'Beach Cleanup Drive',
        description: 'Join us for a community beach cleanup to protect marine life and keep our shores pristine. We will provide all necessary equipment including gloves, trash bags, and picker tools.',
        location: 'Santa Monica Beach, CA',
        requiredSkills: ['Environmental', 'Teamwork', 'Physical Activity'],
        date: new Date('2024-12-20'),
        hours: 4,
        postedBy: ngoUser._id,
        maxVolunteers: 20,
        urgency: 'high',
        category: 'Environment',
        status: 'open'
      },
      {
        title: 'Food Bank Sorting',
        description: 'Help sort and package food donations for families in need during the holiday season. This is a great opportunity to make a direct impact in your community.',
        location: 'Downtown Community Center',
        requiredSkills: ['Organization', 'Physical Activity', 'Attention to Detail'],
        date: new Date('2024-12-18'),
        hours: 3,
        postedBy: ngoUser2._id,
        maxVolunteers: 15,
        urgency: 'medium',
        category: 'Social Services',
        status: 'open'
      },
      {
        title: 'Tree Planting Initiative',
        description: 'Plant native trees in urban areas to improve air quality and create green spaces. Help us make our city greener and more sustainable.',
        location: 'Central Park Area',
        requiredSkills: ['Physical Activity', 'Environmental', 'Gardening'],
        date: new Date('2024-12-25'),
        hours: 5,
        postedBy: ngoUser._id,
        maxVolunteers: 25,
        urgency: 'low',
        category: 'Environment',
        status: 'open'
      },
      {
        title: 'Senior Center Technology Help',
        description: 'Teach elderly residents how to use smartphones, tablets, and computers. Help bridge the digital divide for our senior community members.',
        location: 'Sunset Senior Center',
        requiredSkills: ['Technology', 'Teaching', 'Patience', 'Communication'],
        date: new Date('2024-12-22'),
        hours: 2,
        postedBy: ngoUser2._id,
        maxVolunteers: 8,
        urgency: 'medium',
        category: 'Education',
        status: 'open'
      }
    ];

    await Task.insertMany(tasks);
    console.log('Created sample tasks');

    console.log('\n=== SAMPLE ACCOUNTS CREATED ===');
    console.log('NGO Account 1:');
    console.log('Email: contact@oceanguardians.org');
    console.log('Password: password123');
    console.log('Role: ngo');
    
    console.log('\nNGO Account 2:');
    console.log('Email: info@communityfoodbank.org');
    console.log('Password: password123');
    console.log('Role: ngo');
    
    console.log('\nVolunteer Account:');
    console.log('Email: sarah.johnson@email.com');
    console.log('Password: password123');
    console.log('Role: volunteer');
    
    console.log('\n✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
