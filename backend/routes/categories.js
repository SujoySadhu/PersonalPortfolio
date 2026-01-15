const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
    seedCategories
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/', protect, createCategory);
router.post('/seed', protect, seedCategories);
router.put('/:id', protect, updateCategory);
router.put('/:id/toggle', protect, toggleCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
