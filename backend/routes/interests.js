const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    getInterests,
    getInterest,
    createInterest,
    updateInterest,
    deleteInterest,
    toggleInterest
} = require('../controllers/interestController');

// Public routes
router.get('/', getInterests);
router.get('/:id', getInterest);

// Protected routes
router.post('/', protect, upload.single('image'), createInterest);
router.put('/:id', protect, upload.single('image'), updateInterest);
router.delete('/:id', protect, deleteInterest);
router.put('/:id/toggle', protect, toggleInterest);

module.exports = router;
