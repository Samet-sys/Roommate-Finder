import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Selin Uygun',
    email: 'selin@example.com',
    password: 'password123',
    gender: 'female',
    phone: '+905356708090',
    occupation: 'Software Engineer',
    bio: 'Tech enthusiast, clean and organized',
    preferences: {
      smoking: false,
      pets: true,
      nightLife: true
    },
    isVerified: true,
  },
  {
    name: 'Kris Manakyan',
    email: 'kris@example.com',
    password: 'password123',
    gender: 'male',
    phone: '+905053807800',
    occupation: 'Graduate Student',
    bio: 'PhD student in Biology, early bird',
    preferences: {
      smoking: false,
      pets: false,
      nightLife: false
    },
    isVerified: true,
  },
  {
    name: 'Samet Alkan',
    email: 'samet@example.com',
    password: 'password123',
    gender: 'other',
    phone: '+905061573378',
    occupation: 'Digital Artist',
    bio: 'Creative professional, music lover',
    preferences: {
      smoking: true,
      pets: true,
      nightLife: true
    },
    isVerified: true,
  }
];

const sampleListings = [
  {
    title: 'Modern Room in Downtown Apartment',
    description: 'Bright and spacious room in a newly renovated apartment. Walking distance to public transport and restaurants.',
    location: 'Beşiktaş, İstanbul',
    price: 2500,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Washing Machine', 'Kitchen Access'],
    roomType: 'private',
    availableFrom: new Date('2024-04-01'),
    preferences: {
      smoking: false,
      pets: true,
      nightLife: true,
      gender: 'any',
      ageRange: [20, 35],
      occupation: 'professional'
    }
  },
  {
    title: 'Cozy Room in Student Area',
    description: 'Perfect for students! Shared apartment near university campus with great study environment.',
    location: 'Fatih, İstanbul',
    price: 1800,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3'
    ],
    amenities: ['WiFi', 'Study Desk', 'Shared Kitchen', 'Laundry'],
    roomType: 'private',
    availableFrom: new Date('2024-03-15'),
    preferences: {
      smoking: false,
      pets: false,
      nightLife: false,
      gender: 'female',
      ageRange: [18, 25],
      occupation: 'student'
    }
  },
  {
    title: 'Artist Loft Share in Creative District',
    description: 'Share a beautiful loft space with creative professionals. Perfect for artists and designers.',
    location: 'Altındağ, Ankara',
    price: 3000,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3'
    ],
    amenities: ['Art Studio Space', 'High Ceilings', 'Natural Light', 'Storage'],
    roomType: 'shared',
    availableFrom: new Date('2024-04-15'),
    preferences: {
      smoking: true,
      pets: true,
      nightLife: true,
      gender: 'any',
      ageRange: [22, 40],
      occupation: 'any'
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing data');

    // Create users with hashed passwords
    const createdUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );
    console.log('Created sample users');

    // Create listings with user associations
    const createdListings = await Promise.all(
      sampleListings.map((listing, index) => {
        return Listing.create({
          ...listing,
          host: createdUsers[index]._id
        });
      })
    );
    console.log('Created sample listings');

    // Update users with their listings
    await Promise.all(
      createdUsers.map((user, index) => {
        return User.findByIdAndUpdate(user._id, {
          $push: { listings: createdListings[index]._id }
        });
      })
    );
    console.log('Updated user-listing associations');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();