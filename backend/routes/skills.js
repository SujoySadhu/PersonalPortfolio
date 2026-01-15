const express = require('express');
const router = express.Router();
const {
    getSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill,
    bulkCreateSkills
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getSkills);
router.get('/:id', getSkill);

// Protected routes (Admin only)
router.post('/', protect, createSkill);
router.post('/bulk', protect, bulkCreateSkills);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
