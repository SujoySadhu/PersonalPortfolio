const Project = require('../models/Project');
const { cloudinary } = require('../config/cloudinary');

// Helper: parse techStack from FormData into [{name, category}] objects
const parseTechStack = (raw) => {
    if (!raw) return [];
    // Already an array of objects
    if (Array.isArray(raw)) {
        return raw.map(item => {
            if (typeof item === 'string') return { name: item.trim(), category: 'Tools' };
            return { name: item.name?.trim(), category: item.category || 'Tools' };
        }).filter(item => item.name);
    }
    // JSON string (new format)
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map(item => {
                    if (typeof item === 'string') return { name: item.trim(), category: 'Tools' };
                    return { name: item.name?.trim(), category: item.category || 'Tools' };
                }).filter(item => item.name);
            }
        } catch (e) {
            // Fallback: comma-separated string (old format)
            return raw.split(',').map(t => t.trim()).filter(Boolean).map(name => ({ name, category: 'Tools' }));
        }
    }
    return [];
};

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

        // Exclude full description from list queries — cards only need shortDescription
        const projects = await Project.find(query)
            .select('-description')
            .sort({ order: 1, createdAt: -1 })
            .lean();

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
        const project = await Project.findById(req.params.id).lean();

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
        console.log("CREATE PROJECT REQUEST BODY:", JSON.stringify(req.body));
        
        // Handle pre-uploaded Cloudinary URLs sent as JSON array OR stringified JSON
        let cloudinaryUrls = req.body.cloudinaryUrls;
        
        // If the frontend sent FormData, it might arrive as a stringified JSON array
        if (typeof cloudinaryUrls === 'string') {
            try {
                cloudinaryUrls = JSON.parse(cloudinaryUrls);
            } catch (err) {
                console.error("Failed to parse cloudinaryUrls string:", err);
            }
        }
        
        console.log("Extracted cloudinaryUrls:", cloudinaryUrls);
        
        if (Array.isArray(cloudinaryUrls) && cloudinaryUrls.length > 0) {
            req.body.images = cloudinaryUrls;
            req.body.thumbnail = cloudinaryUrls[0];
        }

        // Parse techStack (already an array from JSON payload)
        req.body.techStack = parseTechStack(req.body.techStack);

        // Remove cloudinaryUrls from what gets saved to DB
        delete req.body.cloudinaryUrls;

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
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Start with existing images from DB
        let updatedImages = project.images || [];

        // Handle stringified arrays from older FormData frontend
        let existingImagesRaw = req.body.existingImages;
        if (typeof existingImagesRaw === 'string') {
            try { existingImagesRaw = JSON.parse(existingImagesRaw); } catch (e) {}
        }

        // existingImages is now a native array from JSON payload (images user chose to keep)
        if (existingImagesRaw !== undefined) {
            updatedImages = Array.isArray(existingImagesRaw)
                ? existingImagesRaw
                : [];
        }

        // Handle stringified arrays from older FormData frontend for new images
        let cloudinaryUrls = req.body.cloudinaryUrls;
        if (typeof cloudinaryUrls === 'string') {
            try { cloudinaryUrls = JSON.parse(cloudinaryUrls); } catch (e) {}
        }

        // cloudinaryUrls is a native array of newly uploaded image URLs
        if (Array.isArray(cloudinaryUrls) && cloudinaryUrls.length > 0) {
            updatedImages = [...updatedImages, ...cloudinaryUrls];
        }

        // Update scalar fields
        if (req.body.title !== undefined) project.title = req.body.title;
        if (req.body.description !== undefined) project.description = req.body.description;
        if (req.body.shortDescription !== undefined) project.shortDescription = req.body.shortDescription;
        if (req.body.youtubeLink !== undefined) project.youtubeLink = req.body.youtubeLink;
        if (req.body.liveDemoLink !== undefined) project.liveDemoLink = req.body.liveDemoLink;
        if (req.body.githubLink !== undefined) project.githubLink = req.body.githubLink;
        if (req.body.category !== undefined) project.category = req.body.category;
        if (req.body.status !== undefined) project.status = req.body.status;
        if (req.body.imageLayout !== undefined) project.imageLayout = req.body.imageLayout;
        if (req.body.order !== undefined) project.order = Number(req.body.order) || 0;

        // Boolean — from JSON it arrives already as boolean
        if (req.body.featured !== undefined) {
            project.featured = req.body.featured === true || req.body.featured === 'true';
        }

        // Parse techStack
        if (req.body.techStack !== undefined) {
            project.techStack = parseTechStack(req.body.techStack);
        }

        // Set images and thumbnail
        project.images = updatedImages;
        project.thumbnail = updatedImages.length > 0 ? updatedImages[0] : '';

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

        // Collect all Cloudinary URLs associated with this project to delete
        const urlsToDelete = [];

        // 1. Legacy images array (if any remain)
        if (project.images && Array.isArray(project.images)) {
            urlsToDelete.push(...project.images);
        }

        // 2. Embedded images in rich-text description
        if (project.description) {
            // Match all Cloudinary URLs inside the HTML string
            const regex = /https:\/\/res\.cloudinary\.com\/[^\s'"]+\/portfolio\/[^\s'"]+/g;
            const matches = project.description.match(regex);
            if (matches) {
                urlsToDelete.push(...matches);
            }
        }

        // Ensure array is unique to avoid triggering duplicate deletions if an image was copied twice
        const uniqueUrls = [...new Set(urlsToDelete)];

        if (uniqueUrls.length > 0) {
            try {
                const publicIds = uniqueUrls.filter(url => url && url.includes('cloudinary')).map(imageUrl => {
                    const parts = imageUrl.split('/');
                    const folder = parts[parts.length - 2];
                    const filename = parts[parts.length - 1].split('.')[0];
                    return `${folder}/${filename}`;
                });
                
                if (publicIds.length > 0) {
                    await cloudinary.api.delete_resources(publicIds);
                    console.log(`[Cloudinary] Successfully batch deleted ${publicIds.length} orphan images.`);
                }
            } catch (e) {
                console.error('[Cloudinary] Batch delete error:', e.message);
            }
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

// @desc    Remove a single image from a project
// @route   PUT /api/projects/:id/remove-image
// @access  Private (Admin)
exports.removeImage = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const { imagePath } = req.body;

        if (!imagePath) {
            return res.status(400).json({
                success: false,
                message: 'imagePath is required'
            });
        }

        // Remove the image from the array
        project.images = project.images.filter(img => img !== imagePath);

        // Update thumbnail if needed
        project.thumbnail = project.images.length > 0 ? project.images[0] : '';

        // Delete from Cloudinary
        try {
            const parts = imagePath.split('/');
            const folder = parts[parts.length - 2];
            const filename = parts[parts.length - 1].split('.')[0];
            await cloudinary.uploader.destroy(`${folder}/${filename}`);
        } catch (e) {
            console.error('Cloudinary delete error:', e.message);
        }

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
