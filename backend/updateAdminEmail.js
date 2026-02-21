// One-time script to update admin email in the database
// Usage: node updateAdminEmail.js <newEmail>
// Example: node updateAdminEmail.js sujoysadhu5@gmail.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const newEmail = process.argv[2];

if (!newEmail) {
    console.log('Usage: node updateAdminEmail.js <newEmail>');
    process.exit(1);
}

async function updateEmail() {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.log('No admin user found!');
        process.exit(1);
    }
    console.log(`Current admin email: ${admin.email}`);
    admin.email = newEmail.toLowerCase().trim();
    await admin.save({ validateModifiedOnly: true });
    console.log(`✅ Admin email updated to: ${admin.email}`);
    process.exit(0);
}

updateEmail().catch(err => { console.error(err); process.exit(1); });
