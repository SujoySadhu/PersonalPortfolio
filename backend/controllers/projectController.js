const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
    try {
        const { featured, category, status } = req.query;
        let query = {};

        if (featured) query.featured = featured === 'true';
        if (category) query.category = category;
        if (status) query.status = status;

        const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
    try {
        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
            req.body.images = imageUrls;
            if (imageUrls.length > 0) {
                req.body.thumbnail = imageUrls[0];
            }
        }

        // Parse techStack if it's a string
        if (typeof req.body.techStack === 'string') {
            req.body.techStack = req.body.techStack.split(',').map(tech => tech.trim());
        }

        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Handle new uploaded files
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            // Append new images to existing ones or replace
            if (req.body.appendImages === 'true') {
                req.body.images = [...project.images, ...newImageUrls];
            } else {
                req.body.images = newImageUrls;
            }
            if (!req.body.thumbnail && newImageUrls.length > 0) {
                req.body.thumbnail = newImageUrls[0];
            }
        }

        // Parse techStack if it's a string
        if (typeof req.body.techStack === 'string') {
            req.body.techStack = req.body.techStack.split(',').map(tech => tech.trim());
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Delete associated images from uploads folder
        if (project.images && project.images.length > 0) {
            project.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        await Project.findByIdAndDelete(req.params.id);

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
// @route   PUT /api/projects/:id/featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.featured = !project.featured;
        await project.save();

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
