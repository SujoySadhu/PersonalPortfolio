const mongoose = require('mongoose');

// Cache the connection across serverless "warm starts"
let cachedConnection = null;

const MONGO_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    family: 4, // prefer IPv4 — avoids many SRV/DNS lookup timeouts (querySrv ETIMEOUT)
};

/**
 * Connect to MongoDB with automatic retry/backoff.
 * Atlas uses a DNS SRV record (mongodb+srv://) whose lookup can intermittently
 * time out; instead of crashing on the first failure, we retry a few times.
 */
const connectWithRetry = async (retriesLeft, delayMs) => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
        cachedConnection = conn;
        console.log('MongoDB Connected: ' + conn.connection.host);
        return conn;
    } catch (error) {
        console.error('Database Connection Error: ' + error.message);
        if (retriesLeft > 0) {
            console.log(`Retrying MongoDB connection in ${delayMs / 1000}s... (${retriesLeft} attempt${retriesLeft > 1 ? 's' : ''} left)`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return connectWithRetry(retriesLeft - 1, delayMs);
        }
        // Out of retries — reject so the caller can handle it.
        // (We never call process.exit() — it would kill serverless functions.)
        throw error;
    }
};

const connectDB = () => connectWithRetry(5, 5000);

// Surface connection lifecycle so transient drops are logged, not silently fatal.
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error: ' + err.message);
});
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — the driver will attempt to reconnect.');
});
mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected.');
});

module.exports = connectDB;
