/**
 * ============================================
 * PASSWORD RESET SCRIPT (Secure CLI Tool)
 * ============================================
 * 
 * Purpose: Reset admin password securely via command line
 * This script requires a secret key to prevent unauthorized access.
 * 
 * Security Features:
 * - Requires ADMIN_SECRET environment variable for authentication
 * - Validates password length (minimum 6 characters)
 * - Verifies user existence before attempting reset
 * 
 * Usage:
 *   node resetPassword.js <email> <new-password> <secret-key>
 * 
 * Example:
 *   node resetPassword.js admin@portfolio.com newpassword123 YourSecretKey123!
 * 
 * Environment Variables:
 *   ADMIN_SECRET - Secret key for authorization (set in .env file)
 * 
 * Security Notes:
 * - Never share the ADMIN_SECRET
 * - Change default secret key in production
 * - Delete this script from production server if not needed
 * 
 * @author Portfolio Admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// ============================================
// SECURITY CONFIGURATION
// ============================================
// Secret key required for password reset authorization
// Set ADMIN_SECRET in .env file for production
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DefaultSecretKey123!';

/**
 * Main function to reset user password
 * Validates inputs, verifies secret key, and updates password
 */
const resetPassword = async () => {
    // Parse command line arguments
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
