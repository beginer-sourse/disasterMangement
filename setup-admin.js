#!/usr/bin/env node

// Setup Admin User Script for Disaster Reporting Platform
// This script helps set up the admin user "keshav" with admin role

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up Admin User for Disaster Reporting Platform');
console.log('=======================================================\n');

try {
  // Check if we're in the correct directory
  const backendPath = path.join(__dirname, 'backend');
  const scriptPath = path.join(backendPath, 'scripts', 'user-management.js');
  
  console.log('📋 Available options:');
  console.log('1. Create new admin user "keshav"');
  console.log('2. Update existing user to admin role');
  console.log('3. List all users');
  console.log('4. Exit\n');

  // For demonstration, let's show how to use the existing script
  console.log('To set up admin user "keshav", run one of these commands:\n');
  
  console.log('Option 1 - Create new admin user:');
  console.log(`cd backend && node scripts/user-management.js create-admin "Keshav" "keshav@admin.com" "admin123"`);
  console.log('');
  
  console.log('Option 2 - Update existing user to admin:');
  console.log(`cd backend && node scripts/user-management.js update "keshav@admin.com" admin`);
  console.log('');
  
  console.log('Option 3 - List all users:');
  console.log(`cd backend && node scripts/user-management.js list`);
  console.log('');
  
  console.log('📝 Note: Make sure to:');
  console.log('1. Start the backend server first');
  console.log('2. Have MongoDB running');
  console.log('3. Update the email/credentials as needed');
  console.log('4. Use the admin credentials to log in to the admin panel');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
