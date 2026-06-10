// make-admin.js - Utility script to promote a registered user to admin role
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('❌ Please provide the email address to promote to admin.');
  console.log('Usage: node make-admin.js your_email@gmail.com');
  process.exit(1);
}

const promote = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Find and update the user
    const user = await User.findOne({ email: emailToPromote.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ No user found with the email: ${emailToPromote}`);
      console.log('Please register this email on the website first.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`\n🎉 Success! User ${user.name} (${user.email}) has been promoted to ADMIN.`);
    console.log('You can now log in with this account and access the Admin Dashboard to add products.\n');

  } catch (error) {
    console.error('❌ Error promoting user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

promote();
