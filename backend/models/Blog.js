const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    coverImage: {
        type: String
    },
    category: {
        type: String,
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: String,
        default: 'Admin'
    },
    published: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number,
        default: 5
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-generate slug from title
blogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Auto-generate excerpt from content if not provided
    if (!this.excerpt && this.content) {
        const plainText = this.content.replace(/<[^>]+>/g, '');
        this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    // Calculate read time (average 200 words per minute)
    if (this.content) {
        const wordCount = this.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200) || 1;
    }
    
    next();
});

// Index for search and filtering
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
