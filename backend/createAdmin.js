/**
 * Create Admin User Script
 * 
 * Usage:
 *   node createAdmin.js
 *   node createAdmin.js <email> <password> <name>
 * 
 * Examples:
 *   node createAdmin.js
 *   node createAdmin.js admin@example.com mypassword123 "John Doe"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    // Default values or command line arguments
    const email = process.argv[2] || 'admin@portfolio.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin';

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio');
        console.log('✓ Connected to MongoDB');
        console.log(`📂 Database: ${mongoose.connection.name}\n`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            console.log(`⚠️  User with email "${email}" already exists!`);
            console.log(`   ID: ${existingUser._id}`);
            console.log(`   Name: ${existingUser.name}`);
            console.log('\n💡 To reset password, use: node resetPassword.js');
            process.exit(0);
        }

        // Create new admin user
        const user = await User.create({
            name,
            email,
            password,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!\n');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('🆔 ID:', user._id);
        console.log('\n🔗 Login at: http://localhost:3000/admin/login');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
