const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { invalidateCache } = require('./middleware/cache');

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
const publicRoutes = require('./routes/public');
const contactRoutes = require('./routes/contact');

// Connect to the database (auto-retries internally). If it ultimately fails,
// keep the server running rather than crashing — requests will error cleanly
// and the driver keeps trying to reconnect in the background.
connectDB().catch((err) => {
    console.error('Initial MongoDB connection failed after retries: ' + err.message);
    console.error('Server is up, but the database is currently unavailable.');
});

// Safety net: a transient async error (e.g. a DNS/DB hiccup) should never take
// the whole server down with an unhandled rejection.
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
    'https://personal-portfolio-avhln58cp-sujoys-projects-e1b2694e.vercel.app',
    'https://personal-portfolio-git-main-sujoys-projects-e1b2694e.vercel.app',
    'https://personal-portfolio-phi.vercel.app',
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    immutable: true,
}));

// Editor image upload endpoint (for Quill rich-text editor)
const upload = require('./middleware/upload');
const { protect } = require('./middleware/auth');
const { documentUpload } = require('./config/cloudinary');

// General-purpose single image upload to Cloudinary (project/canvas/forms)
app.post('/api/upload/image', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    res.status(200).json({ success: true, url: req.file.path });
});

// Accept any field name and MULTIPLE files at once — the editor can upload
// several images in one go; return all their Cloudinary URLs.
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Self-ping mechanism to prevent sleeping on Koyeb/Render
    // Pings the health endpoint every 14 minutes (840000 milliseconds)
    const pingInterval = 14 * 60 * 1000; 
    setInterval(async () => {
        try {
            // Adjust the URL if you have a specific custom domain on Koyeb
            const url = process.env.SERVER_URL || `http://localhost:${PORT}`;
            const response = await fetch(`${url}/api/health`);
            console.log(`[Self-Ping] Status: ${response.status} at ${new Date().toISOString()}`);
        } catch (error) {
            console.error('[Self-Ping] Failed to keep server awake:', error.message);
        }
    }, pingInterval);
});
