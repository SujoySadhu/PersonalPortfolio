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
const { cacheMiddleware } = require('../middleware/cache');

// Public routes
router.get('/', cacheMiddleware(120), getProjects);
router.get('/:id', cacheMiddleware(120), getProject);

// Protected routes (Admin only)
// No multer needed — frontend sends JSON, handled by express.json() in api/index.js
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/featured', protect, toggleFeatured);
router.put('/:id/remove-image', protect, removeImage);

module.exports = router;
