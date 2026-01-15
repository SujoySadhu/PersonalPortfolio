const Interest = require('../models/Interest');

// @desc    Get all interests
// @route   GET /api/interests
// @access  Public
exports.getInterests = async (req, res) => {
    try {
        const { category, active } = req.query;
        
        let query = {};
        if (category) query.category = category;
        if (active === 'true') query.isActive = true;

        const interests = await Interest.find(query).sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: interests.length,
            data: interests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single interest
// @route   GET /api/interests/:id
// @access  Public
exports.getInterest = async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.id);

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        res.status(200).json({
            success: true,
            data: interest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create interest
// @route   POST /api/interests
// @access  Private (Admin)
exports.createInterest = async (req, res) => {
    try {
        const { title, description, icon, category, links, order } = req.body;

        const interestData = {
            title,
            description,
            icon: icon || '💡',
            category,
            order: order || 0
        };

        if (links) {
            interestData.links = JSON.parse(links);
        }

        if (req.file) {
            interestData.image = `/uploads/${req.file.filename}`;
        }

        const interest = await Interest.create(interestData);

        res.status(201).json({
            success: true,
            data: interest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update interest
// @route   PUT /api/interests/:id
// @access  Private (Admin)
exports.updateInterest = async (req, res) => {
    try {
        let interest = await Interest.findById(req.params.id);

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        const { title, description, icon, category, links, order, isActive } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (icon) updateData.icon = icon;
        if (category) updateData.category = category;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        if (links) {
            updateData.links = JSON.parse(links);
        }

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        interest = await Interest.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: interest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete interest
// @route   DELETE /api/interests/:id
// @access  Private (Admin)
exports.deleteInterest = async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.id);

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        await interest.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Interest deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle interest active status
// @route   PUT /api/interests/:id/toggle
// @access  Private (Admin)
exports.toggleInterest = async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.id);

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        interest.isActive = !interest.isActive;
        await interest.save();

        res.status(200).json({
            success: true,
            data: interest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
