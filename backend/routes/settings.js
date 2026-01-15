const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    uploadProfileImage
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(getSettings)
    .put(protect, updateSettings);

router.put('/profile-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;
