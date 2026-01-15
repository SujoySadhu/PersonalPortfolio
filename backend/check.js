/**
 * Check Users Script
 * Run this to see all registered emails in your database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('✓ Connected to MongoDB');
        
        // বর্তমান ডাটাবেসের নাম প্রিন্ট করি
        console.log(`📂 Current Database Name: ${mongoose.connection.name}`);

        const users = await User.find({});
        
        if (users.length === 0) {
            console.log('\n❌ No users found in this database!');
            console.log('Suggestion: Check if your .env MONGO_URI is pointing to the right database.');
        } else {
            console.log(`\n✅ Found ${users.length} user(s):`);
            users.forEach(user => {
                console.log(`-------------------------`);
                console.log(`Email: ${user.email}`);
                console.log(`Role:  ${user.role || 'Not set'}`);
                console.log(`ID:    ${user._id}`);
            });
            console.log(`-------------------------\n`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

checkUsers();