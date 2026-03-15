const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for multer — uploads to "portfolio" folder
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

// Multer upload instance using Cloudinary storage
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 50 * 1024 * 1024  // 50MB for rich-text fields with embedded base64 images
    }
});

module.exports = { cloudinary, upload };
