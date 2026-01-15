const Research = require('../models/Research');

// @desc    Get all research/publications
// @route   GET /api/research
// @access  Public
exports.getResearch = async (req, res) => {
    try {
        const { type, featured } = req.query;
        let query = {};

        if (type) query.type = type;
        if (featured) query.featured = featured === 'true';

        const research = await Research.find(query).sort({ publicationDate: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: research.length,
            data: research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single research
// @route   GET /api/research/:id
// @access  Public
exports.getSingleResearch = async (req, res) => {
    try {
        const research = await Research.findById(req.params.id);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research not found'
            });
        }

        res.status(200).json({
            success: true,
            data: research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new research
// @route   POST /api/research
// @access  Private (Admin)
exports.createResearch = async (req, res) => {
    try {
        // Parse authors and keywords if they're strings
        if (typeof req.body.authors === 'string') {
            req.body.authors = req.body.authors.split(',').map(author => author.trim());
        }
        if (typeof req.body.keywords === 'string') {
            req.body.keywords = req.body.keywords.split(',').map(keyword => keyword.trim());
        }

        const research = await Research.create(req.body);

        res.status(201).json({
            success: true,
            data: research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update research
// @route   PUT /api/research/:id
// @access  Private (Admin)
exports.updateResearch = async (req, res) => {
    try {
        let research = await Research.findById(req.params.id);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research not found'
            });
        }

        // Parse authors and keywords if they're strings
        if (typeof req.body.authors === 'string') {
            req.body.authors = req.body.authors.split(',').map(author => author.trim());
        }
        if (typeof req.body.keywords === 'string') {
            req.body.keywords = req.body.keywords.split(',').map(keyword => keyword.trim());
        }

        research = await Research.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete research
// @route   DELETE /api/research/:id
// @access  Private (Admin)
exports.deleteResearch = async (req, res) => {
    try {
        const research = await Research.findById(req.params.id);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research not found'
            });
        }

        await Research.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle featured status
// @route   PUT /api/research/:id/featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const research = await Research.findById(req.params.id);

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research not found'
            });
        }

        research.featured = !research.featured;
        await research.save();

        res.status(200).json({
            success: true,
            data: research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
