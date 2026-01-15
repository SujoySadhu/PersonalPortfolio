/**
 * Password Reset Script (Secure)
 * 
 * Use this script to reset the admin password if you forget it.
 * Requires secret key for security.
 * 
 * Usage:
 *   node resetPassword.js <email> <new-password> <secret-key>
 * 
 * Example:
 *   node resetPassword.js admin@portfolio.com newpassword123 YourSecretKey123!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DefaultSecretKey123!';

const resetPassword = async () => {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    const secretKey = process.argv[4];

    if (!email || !newPassword || !secretKey) {
        console.log('\n❌ Usage: node resetPassword.js <email> <new-password> <secret-key>');
        console.log('   Example: node resetPassword.js admin@portfolio.com newpass123 YourSecretKey\n');
        process.exit(1);
    }

    // Verify secret key
    if (secretKey !== ADMIN_SECRET) {
        console.log('\n❌ Invalid secret key! Access denied.\n');
        process.exit(1);
    }

    if (newPassword.length < 6) {
        console.log('\n❌ Password must be at least 6 characters long\n');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('✓ Connected to MongoDB');

        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`\n❌ No user found with email: ${email}\n`);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log(`\n✅ Password successfully reset for: ${email}`);
        console.log(`   New password: ${newPassword}\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message, '\n');
        process.exit(1);
    }
};

resetPassword();
