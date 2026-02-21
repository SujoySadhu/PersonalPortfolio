const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected: ' + conn.connection.host);

        // Keep connection alive — prevents Atlas free-tier cold starts
        setInterval(async () => {
            try {
                await mongoose.connection.db.admin().ping();
            } catch (e) {
                console.error('DB keep-alive ping failed:', e.message);
            }
        }, 4 * 60 * 1000); // every 4 minutes
    } catch (error) {
        console.error('Database Connection Error: ' + error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
