const express = require('express');
const router = express.Router();
const {
    getAchievements,
    getAchievement,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    toggleFeatured
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(getAchievements)
    .post(protect, upload.single('image'), createAchievement);

router.route('/:id')
    .get(getAchievement)
    .put(protect, upload.single('image'), updateAchievement)
    .delete(protect, deleteAchievement);

router.put('/:id/featured', protect, toggleFeatured);

module.exports = router;
