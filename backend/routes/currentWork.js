const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    getCurrentWorks,
    getCurrentWork,
    createCurrentWork,
    updateCurrentWork,
    deleteCurrentWork,
    toggleFeatured,
    updateProgress
} = require('../controllers/currentWorkController');

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
