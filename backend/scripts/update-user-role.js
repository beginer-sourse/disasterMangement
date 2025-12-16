// Script to update user role to admin
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

async function updateUserToAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'MONGODB_URI_REQUIRED_FROM_ENV');
    console.log('Connected to MongoDB');

    // Find user by name containing "Keshav" or email
    const user = await User.findOne({
      $or: [
        { name: { $regex: /keshav/i } },
        { email: { $regex: /keshav/i } }
      ]
    });

    if (!user) {
      console.log('No user found with name containing "Keshav"');
      
      // List all users to help identify the correct user
      const allUsers = await User.find({}, 'name email role');
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      return;
    }

    console.log(`Found user: ${user.name} (${user.email}) - Current role: ${user.role}`);

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully updated ${user.name} to admin role`);
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

// Run the script
updateUserToAdmin();
