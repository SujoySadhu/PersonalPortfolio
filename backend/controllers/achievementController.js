const Achievement = require('../models/Achievement');
const path = require('path');
const fs = require('fs');

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
exports.getAchievements = async (req, res) => {
    try {
        const { category, featured } = req.query;
        let query = {};

        if (category) query.category = category;
        if (featured === 'true') query.featured = true;

        const achievements = await Achievement.find(query).sort({ order: 1, date: -1 });

        res.status(200).json({
            success: true,
            count: achievements.length,
            data: achievements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Public
exports.getAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: achievement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private/Admin
exports.createAchievement = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }

        const achievement = await Achievement.create(req.body);

        res.status(201).json({
            success: true,
            data: achievement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private/Admin
exports.updateAchievement = async (req, res) => {
    try {
        let achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        if (req.file) {
            // Delete old image if exists
            if (achievement.image) {
                const oldImagePath = path.join(__dirname, '..', achievement.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            req.body.image = `/uploads/${req.file.filename}`;
        }

        achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: achievement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
exports.deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        // Delete image if exists
        if (achievement.image) {
            const imagePath = path.join(__dirname, '..', achievement.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await achievement.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle featured status
// @route   PUT /api/achievements/:id/featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        achievement.featured = !achievement.featured;
        await achievement.save();

        res.status(200).json({
            success: true,
            data: achievement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
