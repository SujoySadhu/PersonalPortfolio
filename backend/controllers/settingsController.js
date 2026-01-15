const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create({});
        }
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate({}, req.body, {
                new: true,
                runValidators: true
            });
        }
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Upload profile image
// @route   PUT /api/settings/profile-image
// @access  Private/Admin
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        let settings = await Settings.findOne();
        
        // Delete old profile image if exists
        if (settings?.profileImage) {
            const oldImagePath = path.join(__dirname, '..', settings.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        const profileImage = `/uploads/${req.file.filename}`;
        
        if (!settings) {
            settings = await Settings.create({ profileImage });
        } else {
            settings = await Settings.findOneAndUpdate(
                {},
                { profileImage },
                { new: true }
            );
        }
        
        res.status(200).json({
            success: true,
            data: settings,
            profileImage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
