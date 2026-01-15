const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
    getCurrentWorks,
    getCurrentWork,
    createCurrentWork,
    updateCurrentWork,
    deleteCurrentWork,
    toggleFeatured,
    updateProgress
} = require('../controllers/currentWorkController');

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `currentwork-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    }
});

// Public routes
router.get('/', getCurrentWorks);
router.get('/:id', getCurrentWork);

// Protected routes
router.post('/', protect, upload.single('image'), createCurrentWork);
router.put('/:id', protect, upload.single('image'), updateCurrentWork);
router.delete('/:id', protect, deleteCurrentWork);
router.put('/:id/featured', protect, toggleFeatured);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
