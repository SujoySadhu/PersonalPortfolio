const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    toggleFeatured,
    removeImage
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { optimizeImages } = require('../middleware/upload');
const { cacheMiddleware } = require('../middleware/cache');

// Public routes
router.get('/', cacheMiddleware(120), getProjects);
router.get('/:id', cacheMiddleware(120), getProject);

// Protected routes (Admin only)
router.post('/', protect, upload.array('images', 10), optimizeImages, createProject);
router.put('/:id', protect, upload.array('images', 10), optimizeImages, updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/featured', protect, toggleFeatured);
router.put('/:id/remove-image', protect, removeImage);

module.exports = router;
