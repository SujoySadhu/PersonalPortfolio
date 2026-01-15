const Skill = require('../models/Skill');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getSkills = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) query.category = category;

        const skills = await Skill.find(query).sort({ category: 1, order: 1, name: 1 });

        // Group skills by category
        const groupedSkills = skills.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            count: skills.length,
            data: skills,
            grouped: groupedSkills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
exports.getSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private (Admin)
exports.createSkill = async (req, res) => {
    try {
        const skill = await Skill.create(req.body);

        res.status(201).json({
            success: true,
            data: skill
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Skill with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
exports.updateSkill = async (req, res) => {
    try {
        let skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
exports.deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        await Skill.findByIdAndDelete(req.params.id);

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

// @desc    Bulk create skills
// @route   POST /api/skills/bulk
// @access  Private (Admin)
exports.bulkCreateSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of skills'
            });
        }

        const createdSkills = await Skill.insertMany(skills, { ordered: false });

        res.status(201).json({
            success: true,
            count: createdSkills.length,
            data: createdSkills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
