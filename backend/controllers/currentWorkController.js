const CurrentWork = require('../models/CurrentWork');

// @desc    Get all current work items
// @route   GET /api/current-work
// @access  Public
exports.getCurrentWorks = async (req, res) => {
    try {
        const { status, type, category, active, featured } = req.query;
        
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (category) query.category = category;
        if (active === 'true') query.isActive = true;
        if (featured === 'true') query.isFeatured = true;

        const currentWorks = await CurrentWork.find(query)
            .sort({ isFeatured: -1, order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: currentWorks.length,
            data: currentWorks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single current work
// @route   GET /api/current-work/:id
// @access  Public
exports.getCurrentWork = async (req, res) => {
    try {
        const currentWork = await CurrentWork.findById(req.params.id);

        if (!currentWork) {
            return res.status(404).json({
                success: false,
                message: 'Current work not found'
            });
        }

        res.status(200).json({
            success: true,
            data: currentWork
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create current work
// @route   POST /api/current-work
// @access  Private (Admin)
exports.createCurrentWork = async (req, res) => {
    try {
        const { 
            title, description, type, category, status, progress,
            technologies, startDate, expectedEndDate, links, order, isFeatured 
        } = req.body;

        const workData = {
            title,
            description,
            type: type || 'project',
            category,
            status: status || 'in-progress',
            progress: progress || 0,
            order: order || 0,
            isFeatured: isFeatured === 'true' || isFeatured === true
        };

        if (technologies) {
            workData.technologies = typeof technologies === 'string' 
                ? JSON.parse(technologies) 
                : technologies;
        }

        if (links) {
            workData.links = typeof links === 'string' ? JSON.parse(links) : links;
        }

        if (startDate) workData.startDate = startDate;
        if (expectedEndDate) workData.expectedEndDate = expectedEndDate;

        if (req.file) {
            workData.image = `/uploads/${req.file.filename}`;
        }

        const currentWork = await CurrentWork.create(workData);

        res.status(201).json({
            success: true,
            data: currentWork
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update current work
// @route   PUT /api/current-work/:id
// @access  Private (Admin)
exports.updateCurrentWork = async (req, res) => {
    try {
        let currentWork = await CurrentWork.findById(req.params.id);

        if (!currentWork) {
            return res.status(404).json({
                success: false,
                message: 'Current work not found'
            });
        }

        const { 
            title, description, type, category, status, progress,
            technologies, startDate, expectedEndDate, links, order, isActive, isFeatured 
        } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (type) updateData.type = type;
        if (category) updateData.category = category;
        if (status) updateData.status = status;
        if (progress !== undefined) updateData.progress = progress;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (startDate) updateData.startDate = startDate;
        if (expectedEndDate) updateData.expectedEndDate = expectedEndDate;

        if (technologies) {
            updateData.technologies = typeof technologies === 'string' 
                ? JSON.parse(technologies) 
                : technologies;
        }

        if (links) {
            updateData.links = typeof links === 'string' ? JSON.parse(links) : links;
        }

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        currentWork = await CurrentWork.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: currentWork
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete current work
// @route   DELETE /api/current-work/:id
// @access  Private (Admin)
exports.deleteCurrentWork = async (req, res) => {
    try {
        const currentWork = await CurrentWork.findById(req.params.id);

        if (!currentWork) {
            return res.status(404).json({
                success: false,
                message: 'Current work not found'
            });
        }

        await currentWork.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Current work deleted successfully'
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
// @route   PUT /api/current-work/:id/featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const currentWork = await CurrentWork.findById(req.params.id);

        if (!currentWork) {
            return res.status(404).json({
                success: false,
                message: 'Current work not found'
            });
        }

        currentWork.isFeatured = !currentWork.isFeatured;
        await currentWork.save();

        res.status(200).json({
            success: true,
            data: currentWork
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update progress
// @route   PUT /api/current-work/:id/progress
// @access  Private (Admin)
exports.updateProgress = async (req, res) => {
    try {
        const currentWork = await CurrentWork.findById(req.params.id);

        if (!currentWork) {
            return res.status(404).json({
                success: false,
                message: 'Current work not found'
            });
        }

        const { progress } = req.body;
        currentWork.progress = Math.min(100, Math.max(0, progress));
        await currentWork.save();

        res.status(200).json({
            success: true,
            data: currentWork
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
