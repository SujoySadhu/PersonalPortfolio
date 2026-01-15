const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    toggleFeatured
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes (Admin only)
router.post('/', protect, upload.array('images', 10), createProject);
router.put('/:id', protect, upload.array('images', 10), updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:id/featured', protect, toggleFeatured);

module.exports = router;
