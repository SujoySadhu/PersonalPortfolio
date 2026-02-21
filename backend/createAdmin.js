require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    const email = process.argv[2] || 'admin@portfolio.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin';

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('Connected to MongoDB (' + mongoose.connection.name + ')');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User with email "' + email + '" already exists (ID: ' + existingUser._id + ')');
            process.exit(0);
        }

        const user = await User.create({ name, email, password, role: 'admin' });
        console.log('Admin created | Email: ' + email + ' | Password: ' + password + ' | ID: ' + user._id);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
