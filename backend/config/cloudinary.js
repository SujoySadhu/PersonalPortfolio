const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer with memory storage (works on Vercel serverless)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 50 * 1024 * 1024  // 50MB for rich-text fields with embedded base64 images
    }
});

/**
 * Upload a buffer to Cloudinary.
 * Returns a Promise that resolves with the Cloudinary upload result.
 */
function uploadToCloudinary(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const opts = {
            folder: 'portfolio',
            resource_type: 'image',
            transformation: [
                { width: 1920, height: 1920, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            ...options
        };
        const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
}

module.exports = { cloudinary, upload, uploadToCloudinary };
