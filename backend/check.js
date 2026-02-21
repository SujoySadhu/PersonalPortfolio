require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('Connected to MongoDB');
        console.log('Database: ' + mongoose.connection.name);

        const users = await User.find({});
        
        if (users.length === 0) {
            console.log('No users found in this database!');
        } else {
            console.log('Found ' + users.length + ' user(s):');
            users.forEach(user => {
                console.log('  Email: ' + user.email + ' | Role: ' + (user.role || 'Not set') + ' | ID: ' + user._id);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
