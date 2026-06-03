const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

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
            .select('-content')
            .lean();

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
            blogData.coverImage = req.file.path; // Cloudinary URL
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

        // Snapshot old content so we can remove images deleted during this edit
        const oldContent = blog.content || '';

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
            // Delete old cover image from Cloudinary if exists
            if (blog.coverImage && blog.coverImage.includes('cloudinary')) {
                try {
                    const parts = blog.coverImage.split('/');
                    const folder = parts[parts.length - 2];
                    const filename = parts[parts.length - 1].split('.')[0];
                    await cloudinary.uploader.destroy(`${folder}/${filename}`);
                } catch (e) {
                    console.error('Cloudinary delete error:', e.message);
                }
            }
            updateData.coverImage = req.file.path; // Cloudinary URL
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        // --- Clean up content images removed during this edit (best-effort) ---
        try {
            const re = /https?:\/\/res\.cloudinary\.com\/[^\s'"<>()\\]+/g;
            const oldUrls = new Set(oldContent.match(re) || []);
            const newUrls = new Set((blog.content || '').match(re) || []);
            const removedIds = [...oldUrls]
                .filter(u => !newUrls.has(u))
                .map(u => {
                    const m = u.split('?')[0].match(/\/upload\/(?:v\d+\/)?(.+)$/);
                    return m ? m[1].replace(/\.[a-zA-Z0-9]+$/, '') : null;
                })
                .filter(Boolean);
            const uniqueIds = [...new Set(removedIds)];
            if (uniqueIds.length) {
                await cloudinary.api.delete_resources(uniqueIds);
                console.log(`[Cloudinary] Removed ${uniqueIds.length} orphaned blog image(s) on update.`);
            }
        } catch (e) {
            console.error('[Cloudinary] Blog update cleanup error:', e.message);
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

        // Collect all Cloudinary URLs associated with this blog to delete
        const urlsToDelete = [];

        if (blog.coverImage) {
            urlsToDelete.push(blog.coverImage);
        }

        if (blog.content) {
            const regex = /https:\/\/res\.cloudinary\.com\/[^\s'"]+\/portfolio\/[^\s'"]+/g;
            const matches = blog.content.match(regex);
            if (matches) {
                urlsToDelete.push(...matches);
            }
        }

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
                    console.log(`[Cloudinary] Successfully batch deleted ${publicIds.length} orphan blog images.`);
                }
            } catch (e) {
                console.error('[Cloudinary] Batch delete error:', e.message);
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
