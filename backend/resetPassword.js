require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DefaultSecretKey123!';

const resetPassword = async () => {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    const secretKey = process.argv[4];

    if (!email || !newPassword || !secretKey) {
        console.log('Usage: node resetPassword.js <email> <new-password> <secret-key>');
        process.exit(1);
    }

    if (secretKey !== ADMIN_SECRET) {
        console.log('Invalid secret key! Access denied.');
        process.exit(1);
    }

    if (newPassword.length < 6) {
        console.log('Password must be at least 6 characters long');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('No user found with email: ' + email);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();
        console.log('Password reset for: ' + email);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
