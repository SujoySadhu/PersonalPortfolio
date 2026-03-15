const Settings = require('../models/Settings');
const { cloudinary } = require('../config/cloudinary');

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
            // Create new settings if none exist
            settings = await Settings.create(req.body);
        } else {
            // Build update object to properly handle nested socialLinks
            const updateData = { ...req.body };
            
            // If socialLinks is provided, merge it with existing socialLinks
            if (req.body.socialLinks) {
                updateData.socialLinks = {
                    ...settings.socialLinks.toObject(),
                    ...req.body.socialLinks
                };
            }
            
            // Update settings with merged data
            settings = await Settings.findOneAndUpdate(
                {}, 
                { $set: updateData },
                {
                    new: true,
                    runValidators: true
                }
            );
        }
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Settings update error:', error);
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
        
        // Delete old profile image from Cloudinary if exists
        if (settings?.profileImage && settings.profileImage.includes('cloudinary')) {
            try {
                const parts = settings.profileImage.split('/');
                const folder = parts[parts.length - 2];
                const filename = parts[parts.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(`${folder}/${filename}`);
            } catch (e) {
                console.error('Cloudinary delete error:', e.message);
            }
        }
        
        const profileImage = req.file.path; // Cloudinary URL
        
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
