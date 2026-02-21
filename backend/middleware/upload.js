const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDFs are allowed!'), false);
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        fieldSize: 50 * 1024 * 1024  // 50MB for rich-text fields with embedded base64 images
    },
    fileFilter
});

/**
 * Middleware to optimize uploaded images using sharp.
 * Converts large images to WebP, resizes if too big, and compresses.
 * Runs AFTER multer upload middleware.
 */
const optimizeImages = async (req, res, next) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        
        for (const file of files) {
            const ext = path.extname(file.filename).toLowerCase();
            // Skip non-image files (PDFs, GIFs)
            if (['.pdf', '.gif'].includes(ext)) continue;
            
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            const filePath = path.join(uploadsDir, file.filename);
            const optimizedName = file.filename.replace(/\.[^.]+$/, '.webp');
            const optimizedPath = path.join(uploadsDir, optimizedName);
            
            // Skip if file doesn't exist (already processed or missing)
            if (!fs.existsSync(filePath)) continue;
            
            await sharp(filePath)
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(optimizedPath);
            
            // Remove original if it's different from optimized
            if (filePath !== optimizedPath) {
                fs.unlink(filePath, () => {});
            }
            
            // Update file reference
            file.filename = optimizedName;
            file.path = optimizedPath;
        }
        
        next();
    } catch (error) {
        console.error('Image optimization error:', error.message);
        // Continue even if optimization fails — serve original
        next();
    }
};

module.exports = upload;
module.exports.optimizeImages = optimizeImages;
