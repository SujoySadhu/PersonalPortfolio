const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import DB connection
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const researchRoutes = require('./routes/research');
const settingsRoutes = require('./routes/settings');
const achievementRoutes = require('./routes/achievements');
const categoryRoutes = require('./routes/categories');
const blogRoutes = require('./routes/blogs');
const interestRoutes = require('./routes/interests');
const currentWorkRoutes = require('./routes/currentWork');

// Import error handler
const errorHandler = require('./middleware/error');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/current-work', currentWorkRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running!' });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
