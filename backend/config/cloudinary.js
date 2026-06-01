const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// IMAGE STORAGE — uploads to "portfolio" folder
// ============================================
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'portfolio',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
        ]
    }
});

// Multer upload instance using Cloudinary storage (images)
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 50 * 1024 * 1024  // 50MB for rich-text fields with embedded base64 images
    }
});

// ============================================
// DOCUMENT STORAGE — reports, slide decks, etc.
// Stored as Cloudinary "raw" resources so any file type
// (pdf, pptx, docx, xlsx, zip…) uploads and delivers reliably.
// The original extension is kept in the public_id so the
// delivered URL ends with the correct file type.
// ============================================
const DOCUMENT_FORMATS = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];

const sanitizeBaseName = (name = '') =>
    name
        .replace(/\.[^.]+$/, '')              // drop extension
        .replace(/[^a-zA-Z0-9-_]+/g, '-')     // safe chars only (also drops accents/spaces)
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'document';

const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const ext = (file.originalname.split('.').pop() || '').toLowerCase();
        const base = sanitizeBaseName(file.originalname);
        return {
            folder: 'portfolio/documents',
            resource_type: 'raw',
            // Keep extension in the public_id so the raw URL resolves to a real file
            public_id: `${base}-${Date.now()}.${ext}`
        };
    }
});

const documentUpload = multer({
    storage: documentStorage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB — comfortably fits reports & slide decks
    },
    fileFilter: (req, file, cb) => {
        const ext = (file.originalname.split('.').pop() || '').toLowerCase();
        if (DOCUMENT_FORMATS.includes(ext)) return cb(null, true);
        cb(new Error(`Unsupported file type ".${ext}". Allowed: ${DOCUMENT_FORMATS.join(', ')}`));
    }
});

module.exports = { cloudinary, upload, documentUpload, DOCUMENT_FORMATS };
