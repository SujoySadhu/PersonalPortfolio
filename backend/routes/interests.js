const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
    getInterests,
    getInterest,
    createInterest,
    updateInterest,
    deleteInterest,
    toggleInterest
} = require('../controllers/interestController');

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `interest-${Date.now()}${path.extname(file.originalname)}`);
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
router.get('/', getInterests);
router.get('/:id', getInterest);

// Protected routes
router.post('/', protect, upload.single('image'), createInterest);
router.put('/:id', protect, upload.single('image'), updateInterest);
router.delete('/:id', protect, deleteInterest);
router.put('/:id/toggle', protect, toggleInterest);

module.exports = router;
