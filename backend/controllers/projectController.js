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

// Helper: sanitize an attachments array coming from the JSON payload
const parseAttachments = (raw) => {
    if (!raw) return [];
    let arr = raw;
    if (typeof raw === 'string') {
        try { arr = JSON.parse(raw); } catch (e) { return []; }
    }
    if (!Array.isArray(arr)) return [];
    return arr
        .map(a => ({
            name: (a.name || '').toString().trim() || 'Document',
            url: (a.url || '').toString().trim(),
            format: (a.format || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8),
            bytes: Number(a.bytes) || 0,
            uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date()
        }))
        .filter(a => a.url); // a valid attachment must have a URL
};

// Helper: extract the Cloudinary "raw" public_id (incl. extension) from a delivery URL
const rawPublicIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.split('?')[0].match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    return match ? match[1] : null;
};

// Helper: collect Cloudinary URLs from any mix of HTML strings and arrays
const collectCloudinaryUrls = (...sources) => {
    const urls = [];
    for (const src of sources) {
        if (!src) continue;
        if (Array.isArray(src)) {
            for (const u of src) if (typeof u === 'string' && u.includes('res.cloudinary.com')) urls.push(u);
        } else if (typeof src === 'string') {
            const m = src.match(/https?:\/\/res\.cloudinary\.com\/[^\s'"<>()\\]+/g);
            if (m) urls.push(...m);
        }
    }
    return urls;
};

// Helper: Cloudinary IMAGE public_id from a delivery URL (folder/name, no extension)
const imagePublicIdFromUrl = (url) => {
    if (!url) return null;
    const m = url.split('?')[0].match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!m) return null;
    return m[1].replace(/\.[a-zA-Z0-9]+$/, '');
};

// Helper: normalize a canvas object coming from the JSON payload (or string)
const parseCanvas = (raw) => {
    if (raw === undefined || raw === null) return undefined;
    let c = raw;
    if (typeof c === 'string') {
        try { c = JSON.parse(c); } catch (e) { return undefined; }
    }
    if (!c || typeof c !== 'object') return undefined;
    return c;
};

// Helper: all image src URLs used inside a canvas
const canvasImageUrls = (canvas) => {
    if (!canvas || !Array.isArray(canvas.elements)) return [];
    return canvas.elements
        .filter(el => el && el.type === 'image' && typeof el.src === 'string')
        .map(el => el.src);
};

// Helper: best-effort batch delete of Cloudinary assets (never throws)
const deleteCloudinaryAssets = async (publicIds, resourceType) => {
    const ids = [...new Set((publicIds || []).filter(Boolean))];
    if (!ids.length) return;
    try {
        await cloudinary.api.delete_resources(ids, resourceType ? { resource_type: resourceType } : {});
        console.log(`[Cloudinary] Deleted ${ids.length} ${resourceType || 'image'} asset(s).`);
    } catch (e) {
        console.error('[Cloudinary] Delete error:', e.message);
    }
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
        // Handle pre-uploaded Cloudinary URLs sent as JSON array OR stringified JSON
        let cloudinaryUrls = req.body.cloudinaryUrls;

        // If the frontend sent FormData, it might arrive as a stringified JSON array
        if (typeof cloudinaryUrls === 'string') {
            try {
                cloudinaryUrls = JSON.parse(cloudinaryUrls);
            } catch (err) {
                cloudinaryUrls = undefined;
            }
        }

        if (Array.isArray(cloudinaryUrls) && cloudinaryUrls.length > 0) {
            req.body.images = cloudinaryUrls;
            req.body.thumbnail = cloudinaryUrls[0];
        }

        // Parse techStack (already an array from JSON payload)
        req.body.techStack = parseTechStack(req.body.techStack);

        // Parse downloadable resources (reports, slide decks, etc.)
        req.body.attachments = parseAttachments(req.body.attachments);

        // Parse the visual canvas (slide of images + text boxes)
        const parsedCanvas = parseCanvas(req.body.canvas);
        if (parsedCanvas) req.body.canvas = parsedCanvas; else delete req.body.canvas;

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

        // Snapshot the OLD media so we can delete anything removed during this edit
        const oldDescription = project.description || '';
        const oldImages = Array.isArray(project.images) ? project.images.slice() : [];
        const oldAttachmentUrls = Array.isArray(project.attachments)
            ? project.attachments.map(a => a && a.url).filter(Boolean)
            : [];
        const oldCanvasImageUrls = canvasImageUrls(project.canvas);

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

        // Update downloadable resources (full replace — frontend sends the desired final list)
        if (req.body.attachments !== undefined) {
            project.attachments = parseAttachments(req.body.attachments);
        }

        // Update the visual canvas
        if (req.body.canvas !== undefined) {
            const parsedCanvas = parseCanvas(req.body.canvas);
            project.canvas = parsedCanvas; // undefined clears it
            project.markModified('canvas');
        }

        // Set images and thumbnail
        project.images = updatedImages;
        project.thumbnail = updatedImages.length > 0 ? updatedImages[0] : '';

        await project.save();

        // --- Clean up Cloudinary assets removed during this edit (best-effort) ---
        try {
            // Images: anything in the old description/images/canvas that's no longer present
            const oldImageUrls = new Set(collectCloudinaryUrls(oldDescription, oldImages, oldCanvasImageUrls));
            const newImageUrls = new Set(collectCloudinaryUrls(project.description, project.images, canvasImageUrls(project.canvas)));
            const removedImageIds = [...oldImageUrls]
                .filter(u => !newImageUrls.has(u))
                .map(imagePublicIdFromUrl);
            await deleteCloudinaryAssets(removedImageIds); // image resource type

            // Attachments (raw): anything in the old list that's no longer present
            const newAttachmentUrls = new Set((project.attachments || []).map(a => a && a.url).filter(Boolean));
            const removedAttachmentIds = oldAttachmentUrls
                .filter(u => !newAttachmentUrls.has(u))
                .map(rawPublicIdFromUrl);
            await deleteCloudinaryAssets(removedAttachmentIds, 'raw');
        } catch (e) {
            console.error('[Cloudinary] Orphan cleanup on update failed:', e.message);
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

        // Remove all Cloudinary assets owned by this project (best-effort).
        // Images: embedded in the description + the legacy images array + the canvas.
        const imageIds = collectCloudinaryUrls(project.description, project.images, canvasImageUrls(project.canvas)).map(imagePublicIdFromUrl);
        await deleteCloudinaryAssets(imageIds);

        // Attachments are raw resources — delete with the raw resource type.
        const attachmentIds = (project.attachments || [])
            .map(att => att && att.url)
            .filter(Boolean)
            .map(rawPublicIdFromUrl);
        await deleteCloudinaryAssets(attachmentIds, 'raw');

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
