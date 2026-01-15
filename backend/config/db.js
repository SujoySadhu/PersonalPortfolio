/**
 * ============================================
 * DATABASE CONFIGURATION - MongoDB Connection
 * ============================================
 * 
 * Establishes connection to MongoDB using Mongoose ODM.
 * Connection string is read from environment variables.
 * 
 * Environment Variables:
 * - MONGODB_URI: Full MongoDB connection string
 *   Example: mongodb+srv://user:pass@cluster.mongodb.net/dbname
 * 
 * Connection Features:
 * - Automatic reconnection on failure
 * - Connection pooling handled by Mongoose
 * - Process exits on connection failure
 * 
 * @author Portfolio Admin
 */

const mongoose = require('mongoose');

/**
 * Establish MongoDB connection
 * Uses async/await for clean error handling
 * Logs connection host on success
 * Exits process on failure to prevent app running without database
 */
const connectDB = async () => {
    try {
        // Attempt to connect using URI from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log error and exit with failure code
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);  // Exit with failure status
    }
};

module.exports = connectDB;
