const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    images: [{
        type: String // URLs to images
    }],
    thumbnail: {
        type: String // Main display image
    },
    youtubeLink: {
        type: String,
        default: ''
    },
    liveDemoLink: {
        type: String,
        default: ''
    },
    githubLink: {
        type: String,
        default: ''
    },
    techStack: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['web', 'mobile', 'desktop', 'ai-ml', 'other'],
        default: 'web'
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['completed', 'in-progress', 'archived'],
        default: 'completed'
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better query performance
ProjectSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
