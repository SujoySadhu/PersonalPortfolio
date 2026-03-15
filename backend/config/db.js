const mongoose = require('mongoose');

// Cache the connection across serverless "warm starts"
let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('Using cached MongoDB connection');
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        cachedConnection = conn;
        console.log('MongoDB Connected: ' + conn.connection.host);
        return conn;
    } catch (error) {
        console.error('Database Connection Error: ' + error.message);
        // Don't call process.exit(1) in serverless — it kills the function
        throw error;
    }
};

module.exports = connectDB;
