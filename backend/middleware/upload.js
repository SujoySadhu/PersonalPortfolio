/**
 * Upload Middleware — Cloudinary-based
 * 
 * Uses multer-storage-cloudinary instead of disk storage.
 * The uploaded file URL is available at req.file.path (Cloudinary URL).
 * 
 * For multi-file uploads (projects), use upload.array('images', 10).
 * For single file uploads, use upload.single('fieldName').
 */
const { upload } = require('../config/cloudinary');

module.exports = upload;
