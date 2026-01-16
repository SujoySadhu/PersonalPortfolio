/**
 * ============================================
 * server.js - Main Application Entry Point
 * ============================================
 * 
 * This is the primary Express server for the Portfolio application.
 * It sets up middleware, database connection, routes, and error handling.
 * 
 * Architecture: MVC (Model-View-Controller)
 * - Models: ./models/ (Mongoose schemas)
 * - Controllers: ./controllers/ (Business logic)
 * - Routes: ./routes/ (API endpoints)
 * 
 * @author Portfolio Admin
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ============================================
// DATABASE CONFIGURATION
// ============================================
// Import and establish MongoDB connection
const connectDB = require('./config/db');

// ============================================
// ROUTE IMPORTS
// ============================================
// Import all API route handlers
const authRoutes = require('./routes/auth');           // Authentication (login, register)
const projectRoutes = require('./routes/projects');     // Portfolio projects CRUD
const skillRoutes = require('./routes/skills');         // Technical skills management
const researchRoutes = require('./routes/research');    // Research papers/publications
const settingsRoutes = require('./routes/settings');    // Profile settings & social links
const achievementRoutes = require('./routes/achievements'); // Achievements & certifications
const categoryRoutes = require('./routes/categories');  // Project/Achievement categories
const blogRoutes = require('./routes/blogs');           // Blog posts CRUD
const interestRoutes = require('./routes/interests');   // Personal interests section
const currentWorkRoutes = require('./routes/currentWork'); // Currently working on section

// ============================================
// MIDDLEWARE IMPORTS
// ============================================
// Import custom error handling middleware
const errorHandler = require('./middleware/error');

// ============================================
// DATABASE CONNECTION
// ============================================
// Establish connection to MongoDB
connectDB();

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// BODY PARSER MIDDLEWARE
// ============================================
// Parse JSON request bodies (for API requests)
app.use(express.json());
// Parse URL-encoded form data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// CORS CONFIGURATION
// ============================================
// Enable Cross-Origin Resource Sharing
// Allows frontend (React app) to communicate with backend

// List of allowed origins for CORS
// Add your Vercel deployment URLs here
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://personal-portfolio-avhln58cp-sujoys-projects-e1b2694e.vercel.app',
    'https://personal-portfolio-git-main-sujoys-projects-e1b2694e.vercel.app',
    'https://personal-portfolio-phi.vercel.app',
    // Add any other Vercel preview URLs or custom domains here
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow all Vercel preview deployments
        if (origin.includes('vercel.app')) {
            return callback(null, true);
        }
        
        // For development - allow all origins (can restrict in production)
        return callback(null, true);
    },
    credentials: true,  // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ============================================
// STATIC FILE SERVING
// ============================================
// Serve uploaded files (images, documents) from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API ROUTE MOUNTING
// ============================================
// Mount all API routes with their respective prefixes
app.use('/api/auth', authRoutes);           // POST /api/auth/login, /api/auth/register
app.use('/api/projects', projectRoutes);     // CRUD /api/projects
app.use('/api/skills', skillRoutes);         // CRUD /api/skills
app.use('/api/research', researchRoutes);    // CRUD /api/research
app.use('/api/settings', settingsRoutes);    // GET/PUT /api/settings
app.use('/api/achievements', achievementRoutes); // CRUD /api/achievements
app.use('/api/categories', categoryRoutes);  // CRUD /api/categories
app.use('/api/blogs', blogRoutes);           // CRUD /api/blogs
app.use('/api/interests', interestRoutes);   // CRUD /api/interests
app.use('/api/current-work', currentWorkRoutes); // CRUD /api/current-work

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
// Simple endpoint to verify server is running
// Useful for monitoring and deployment checks
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running!' });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Custom error handler (must be registered after routes)
app.use(errorHandler);

// ============================================
// 404 NOT FOUND HANDLER
// ============================================
// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============================================
// SERVER INITIALIZATION
// ============================================
// Start the server on specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
});
