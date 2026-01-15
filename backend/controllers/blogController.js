const Blog = require('../models/Blog');
const path = require('path');
const fs = require('fs');

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const { category, tag, featured, published, search, limit = 10, page = 1 } = req.query;
        
        let query = {};
        
        // For public access, only show published posts
        if (published === 'true' || !req.user) {
            query.published = true;
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        if (featured === 'true') {
            query.featured = true;
        }
        
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-content');

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            count: blogs.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single blog post
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlog = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Try to find by slug first, then by ID
        let blog = await Blog.findOne({ slug });
        
        if (!blog) {
            blog = await Blog.findById(slug);
        }

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Increment view count for public access
        if (blog.published) {
            blog.views += 1;
            await blog.save();
        }

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, author, published, featured, metaTitle, metaDescription } = req.body;

        const blogData = {
            title,
            excerpt,
            content,
            category: category || 'general',
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
            author: author || 'Admin',
            published: published === 'true' || published === true,
            featured: featured === 'true' || featured === true,
            metaTitle,
            metaDescription
        };

        // Handle cover image upload
        if (req.file) {
            blogData.coverImage = `/uploads/${req.file.filename}`;
        }

        const blog = await Blog.create(blogData);

        res.status(201).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        const { title, excerpt, content, category, tags, author, published, featured, metaTitle, metaDescription } = req.body;

        const updateData = {
            title: title || blog.title,
            excerpt: excerpt || blog.excerpt,
            content: content || blog.content,
            category: category || blog.category,
            author: author || blog.author,
            published: published !== undefined ? (published === 'true' || published === true) : blog.published,
            featured: featured !== undefined ? (featured === 'true' || featured === true) : blog.featured,
            metaTitle: metaTitle || blog.metaTitle,
            metaDescription: metaDescription || blog.metaDescription
        };

        // Handle tags
        if (tags) {
            updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
        }

        // Handle cover image upload
        if (req.file) {
            // Delete old image if exists
            if (blog.coverImage) {
                const oldImagePath = path.join(__dirname, '..', blog.coverImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.coverImage = `/uploads/${req.file.filename}`;
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Delete cover image if exists
        if (blog.coverImage) {
            const imagePath = path.join(__dirname, '..', blog.coverImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await blog.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle blog publish status
// @route   PUT /api/blogs/:id/publish
// @access  Private (Admin)
exports.togglePublish = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        blog.published = !blog.published;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle blog featured status
// @route   PUT /api/blogs/:id/featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        blog.featured = !blog.featured;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all unique tags
// @route   GET /api/blogs/tags
// @access  Public
exports.getTags = async (req, res) => {
    try {
        const tags = await Blog.distinct('tags', { published: true });
        
        res.status(200).json({
            success: true,
            data: tags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
