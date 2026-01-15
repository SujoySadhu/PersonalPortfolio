/**
 * ============================================
 * CHECK USERS UTILITY SCRIPT
 * ============================================
 * 
 * Purpose: Debug utility to inspect all registered users in the database
 * Usage: node check.js
 * 
 * This script connects to MongoDB and displays all user accounts,
 * helping to verify admin creation and troubleshoot authentication issues.
 * 
 * Output includes:
 * - Current database name (to verify correct DB connection)
 * - List of all users with their email, role, and MongoDB ObjectId
 * 
 * @author Portfolio Admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Main function to check and display all users
 * Connects to MongoDB, queries users, and formats output
 */
const checkUsers = async () => {
    try {
        // Establish database connection using environment variable or fallback
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('✓ Connected to MongoDB');
        
        // Display the current database name for verification
        console.log(`📂 Current Database Name: ${mongoose.connection.name}`);

        // Fetch all user documents from the users collection
        const users = await User.find({});
        
        if (users.length === 0) {
            // No users found - provide helpful troubleshooting message
            console.log('\n❌ No users found in this database!');
            console.log('Suggestion: Check if your .env MONGO_URI is pointing to the right database.');
        } else {
            // Display formatted list of all users
            console.log(`\n✅ Found ${users.length} user(s):`);
            users.forEach(user => {
                console.log(`-------------------------`);
                console.log(`Email: ${user.email}`);
                console.log(`Role:  ${user.role || 'Not set'}`);
                console.log(`ID:    ${user._id}`);
            });
            console.log(`-------------------------\n`);
        }
        
        // Exit successfully
        process.exit(0);
    } catch (error) {
        // Handle connection or query errors
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

// Execute the check function
checkUsers();