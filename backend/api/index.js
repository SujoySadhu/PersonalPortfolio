const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('../config/db');
const errorHandler = require('../middleware/error');
const { invalidateCache } = require('../middleware/cache');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

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

connectDB().catch(err => console.error('Initial DB connection failed:', err.message));

const app = express();

app.use(compression());

// Conditionally parse body — skip for multipart (let multer handle it)
app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return next(); // Skip body parsers for file uploads
    }
    express.json({ limit: '50mb' })(req, res, (err) => {
        if (err) return next(err);
        express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
    });
});

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

// Helper: wraps multer middleware in a Promise so errors are caught on Vercel
// Also handles the case where Vercel has already consumed the body stream
function runMulter(req, res) {
    return new Promise((resolve, reject) => {
        // If Vercel has pre-parsed the body into a Buffer, re-create the stream
        if (req.body && Buffer.isBuffer(req.body)) {
            const { Readable } = require('stream');
            const bodyStream = new Readable();
            bodyStream.push(req.body);
            bodyStream.push(null);
            // Monkey-patch req to act as a readable stream for multer
            req.pipe = bodyStream.pipe.bind(bodyStream);
            req.unpipe = bodyStream.unpipe.bind(bodyStream);
            req.on = bodyStream.on.bind(bodyStream);
            req.once = bodyStream.once.bind(bodyStream);
            req.removeListener = bodyStream.removeListener.bind(bodyStream);
            req.emit = bodyStream.emit.bind(bodyStream);
            req.readable = true;
        }
        upload.single('image')(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// General-purpose single image upload to Cloudinary
// Uses memoryStorage + manual Cloudinary upload (reliable on Vercel serverless)
app.post('/api/upload/image', require('../middleware/auth').protect, async (req, res) => {
    try {
        await runMulter(req, res);
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        const result = await uploadToCloudinary(req.file.buffer);
        res.status(200).json({
            success: true,
            url: result.secure_url
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
    }
});

// Editor image upload endpoint (for Quill rich-text editor)
app.post('/api/upload/editor-image', require('../middleware/auth').protect, async (req, res) => {
    try {
        await runMulter(req, res);
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        const result = await uploadToCloudinary(req.file.buffer);
        res.status(200).json({
            success: true,
            url: result.secure_url
        });
    } catch (error) {
        console.error('Editor image upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
    }
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

// Disable Vercel's automatic body parsing so multer can read the raw stream
module.exports.config = {
    api: {
        bodyParser: false
    }
};
