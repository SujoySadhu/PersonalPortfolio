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
const multer = require('multer');
const { cacheMiddleware } = require('../middleware/cache');

// Plain multer instance (memoryStorage) — only parses FormData text fields.
// Actual image files are pre-uploaded via /api/upload/editor-image,
// so we don't need multer-storage-cloudinary here.
const formParser = multer();

// Public routes
router.get('/', cacheMiddleware(120), getProjects);
router.get('/:id', cacheMiddleware(120), getProject);

// Protected routes (Admin only)
router.post('/', protect, formParser.none(), createProject);
router.put('/:id', protect, formParser.none(), updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/featured', protect, toggleFeatured);
router.put('/:id/remove-image', protect, removeImage);

module.exports = router;
