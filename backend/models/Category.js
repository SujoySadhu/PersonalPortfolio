const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Section is required'],
        enum: ['project', 'skill', 'research', 'achievement', 'blog', 'interest', 'currentwork'],
        index: true
    },
    icon: {
        type: String,
        default: '📁'
    },
    color: {
        type: String,
        default: 'from-gray-500 to-slate-500'
    },
    description: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Auto-generate slug from name
categorySchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
});

// Index for faster queries
categorySchema.index({ section: 1, order: 1 });
categorySchema.index({ section: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
