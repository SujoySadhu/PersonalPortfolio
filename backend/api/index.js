const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('../config/db');
const errorHandler = require('../middleware/error');
const { invalidateCache } = require('../middleware/cache');
const { upload, documentUpload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const authRoutes = require('../routes/auth');
const projectRoutes = require('../routes/projects');
const skillRoutes = require('../routes/skills');
const researchRoutes = require('../routes/research');
const settingsRoutes = require('../routes/settings');
const achievementRoutes = require('../routes/achievements');
const categoryRoutes = require('../routes/categories');
const blogRoutes = require('../routes/blogs');
const interestRoutes = require('../routes/interests');
const currentWorkRoutes = require('../routes/currentWork');
const publicRoutes = require('../routes/public');
const contactRoutes = require('../routes/contact');

connectDB().catch((err) => {
    console.error('Initial MongoDB connection failed after retries: ' + err.message);
});

// Safety net so a transient DB/DNS hiccup can't crash the function
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection] ' + (reason && reason.message ? reason.message : reason));
});

const app = express();

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://sujoysadhu.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// General-purpose single image upload to Cloudinary
// Used by forms (projects, achievements, etc.) to upload images one-at-a-time
// This avoids Vercel's 4.5MB body size limit by uploading each image separately
app.post('/api/upload/image', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    res.status(200).json({
        success: true,
        url: req.file.path // Cloudinary URL
    });
});

// Editor image upload endpoint — accepts any field name and MULTIPLE files at
// once; returns all uploaded Cloudinary URLs.
app.post('/api/upload/editor-image', protect, upload.any(), (req, res) => {
    const files = (req.files && req.files.length) ? req.files : (req.file ? [req.file] : []);
    if (!files.length) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const urls = files.map((f) => f.path);
    res.status(200).json({
        success: true,
        url: urls[0], // first URL (back-compat)
        urls          // all uploaded URLs
    });
});

// Document upload endpoint (reports, slide decks, etc.) — stored as Cloudinary raw files
app.post('/api/upload/document', protect, (req, res) => {
    documentUpload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
        const originalName = req.file.originalname || 'document';
        res.status(200).json({
            success: true,
            url: req.file.path,
            originalName,
            format: (originalName.split('.').pop() || '').toLowerCase(),
            bytes: req.file.size || req.file.bytes || 0
        });
    });
});

// Cache invalidation for write operations — MUST be before routes
app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                invalidateCache('public');
                invalidateCache(req.baseUrl);
            }
            return originalJson(body);
        };
    }
    next();
});

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
app.use('/api/public', publicRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running!', timestamp: Date.now() });
});

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
