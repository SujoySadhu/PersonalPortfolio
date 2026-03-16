/**
 * Upload Middleware — Memory-based (Vercel serverless compatible)
 * 
 * Uses multer memoryStorage instead of disk/cloudinary storage.
 * The uploaded file buffer is available at req.file.buffer.
 * 
 * For multi-file uploads (projects), use upload.array('images', 10).
 * For single file uploads, use upload.single('fieldName').
 */
const { upload } = require('../config/cloudinary');

module.exports = upload;
