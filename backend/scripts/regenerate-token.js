// Script to regenerate JWT token for a user
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: String,
  isVerified: { type: Boolean, default: false },
  lastLoginAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function regenerateToken(userIdentifier) {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required');
      console.error('Please set MONGODB_URI in your .env file');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Try to find user by email first, then by name
    let user = await User.findOne({ email: userIdentifier });
    
    if (!user) {
      user = await User.findOne({ name: { $regex: new RegExp(userIdentifier, 'i') } });
    }
    
    // Only try by ID if it looks like a valid ObjectId
    if (!user && userIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userIdentifier);
    }

    if (!user) {
      console.log('❌ No user found with the given identifier');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email}) - Role: ${user.role}`);

    // Generate new JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'disaster-alert-super-secret-jwt-key-2024';
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '7d' });

    console.log('\n✅ New JWT Token Generated:');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    console.log('\n📋 User Details:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`User ID: ${user._id}`);
    console.log('\n💡 Instructions:');
    console.log('1. Copy the token above');
    console.log('2. In your browser, open Developer Tools (F12)');
    console.log('3. Go to Application/Storage tab');
    console.log('4. Find "Local Storage" or "Session Storage"');
    console.log('5. Look for "token" key and replace its value with the new token');
    console.log('6. Refresh the page');

  } catch (error) {
    console.error('Error regenerating token:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get user identifier from command line
const userIdentifier = process.argv[2];

if (!userIdentifier) {
  console.log('Usage: node regenerate-token.js <user-identifier>');
  console.log('Example: node regenerate-token.js keshavjha1627@gmail.com');
  console.log('Example: node regenerate-token.js Keshav');
  process.exit(1);
}

regenerateToken(userIdentifier);
