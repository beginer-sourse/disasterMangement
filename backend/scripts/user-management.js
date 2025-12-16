// User Management Script for Disaster Reporting Platform
const mongoose = require('mongoose');
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

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'MONGODB_URI_REQUIRED_FROM_ENV');
    console.log('Connected to MongoDB\n');

    const users = await User.find({}, 'name email role createdAt lastLoginAt');
    
    console.log('📋 All Users:');
    console.log('='.repeat(80));
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role.toUpperCase()}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}`);
      console.log(`   ID: ${user._id}`);
      console.log('-'.repeat(80));
    });

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

async function updateUserRole(userIdentifier, newRole) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'MONGODB_URI_REQUIRED_FROM_ENV');
    console.log('Connected to MongoDB');

    if (!['user', 'admin'].includes(newRole)) {
      console.error('❌ Invalid role. Must be "user" or "admin"');
      return;
    }

    // Try to find user by ID, email, or name
    let user = await User.findById(userIdentifier);
    
    if (!user) {
      user = await User.findOne({ email: userIdentifier });
    }
    
    if (!user) {
      user = await User.findOne({ name: { $regex: new RegExp(userIdentifier, 'i') } });
    }

    if (!user) {
      console.log('❌ No user found with the given identifier');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email}) - Current role: ${user.role}`);

    // Update user role
    user.role = newRole;
    await user.save();

    console.log(`✅ Successfully updated ${user.name} to ${newRole} role`);
    console.log(`User ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function createAdminUser(name, email, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'MONGODB_URI_REQUIRED_FROM_ENV');
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists with this email');
      return;
    }

    // Create new admin user
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    await user.save();

    console.log(`✅ Successfully created admin user: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`User ID: ${user._id}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Command line interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];

switch (command) {
  case 'list':
    listUsers();
    break;
  case 'update':
    if (!arg1 || !arg2) {
      console.log('Usage: node user-management.js update <user-identifier> <new-role>');
      console.log('Example: node user-management.js update keshavjha1627@gmail.com admin');
      break;
    }
    updateUserRole(arg1, arg2);
    break;
  case 'create-admin':
    if (!arg1 || !arg2 || !arg3) {
      console.log('Usage: node user-management.js create-admin <name> <email> <password>');
      console.log('Example: node user-management.js create-admin "Admin User" admin@example.com password123');
      break;
    }
    createAdminUser(arg1, arg2, arg3);
    break;
  default:
    console.log('🔧 User Management Script');
    console.log('=======================');
    console.log('');
    console.log('Available commands:');
    console.log('  list                    - List all users');
    console.log('  update <id/email/name> <role>  - Update user role');
    console.log('  create-admin <name> <email> <password>  - Create new admin user');
    console.log('');
    console.log('Examples:');
    console.log('  node user-management.js list');
    console.log('  node user-management.js update keshavjha1627@gmail.com admin');
    console.log('  node user-management.js create-admin "John Admin" john@admin.com password123');
    break;
}
