/**
 * ============================================
 * FILE UPLOAD MIDDLEWARE - Multer Configuration
 * ============================================
 * 
 * Configures file upload handling using Multer.
 * Used for uploading project images, profile photos, etc.
 * 
 * Features:
 * - Unique filename generation to prevent conflicts
 * - File type validation (images and PDFs only)
 * - File size limit (10MB maximum)
 * - Disk storage in /uploads directory
 * 
 * Allowed File Types:
 * - Images: jpeg, jpg, png, gif, webp
 * - Documents: pdf
 * 
 * Usage in Routes:
 *   router.post('/upload', upload.single('image'), controller);
 *   router.post('/gallery', upload.array('images', 10), controller);
 * 
 * @author Portfolio Admin
 */

const multer = require('multer');
const path = require('path');

// ============================================
// STORAGE CONFIGURATION
// ============================================
/**
 * Configure disk storage for uploaded files
 * Files are saved to /uploads directory with unique names
 */
const storage = multer.diskStorage({
    // Set upload destination folder
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    // Generate unique filename: fieldname-timestamp-random.extension
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ============================================
// FILE FILTER
// ============================================
/**
 * Validates file type before upload
 * Rejects files that don't match allowed types
 * 
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
    // Define allowed file extensions
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    
    // Check both file extension and MIME type for security
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);  // Accept file
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDFs are allowed!'), false);
    }
};

// ============================================
// MULTER INSTANCE
// ============================================
/**
 * Create configured Multer instance
 * Combines storage, file filter, and size limits
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB maximum file size
    },
    fileFilter: fileFilter
});

module.exports = upload;
