const express = require('express');
const router = express.Router();
const {
    getResearch,
    getSingleResearch,
    createResearch,
    updateResearch,
    deleteResearch,
    toggleFeatured
} = require('../controllers/researchController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getResearch);
router.get('/:id', getSingleResearch);

// Protected routes (Admin only)
router.post('/', protect, createResearch);
router.put('/:id', protect, updateResearch);
router.delete('/:id', protect, deleteResearch);
router.put('/:id/featured', protect, toggleFeatured);

module.exports = router;
