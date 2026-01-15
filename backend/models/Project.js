/**
 * ============================================
 * PROJECT MODEL - Portfolio Projects Schema
 * ============================================
 * 
 * Defines the schema for portfolio projects displayed on the website.
 * Supports multiple images, videos, and various project metadata.
 * 
 * Features:
 * - Multiple image gallery support
 * - YouTube video embedding
 * - GitHub and live demo links
 * - Tech stack tagging
 * - Category classification
 * - Featured project highlighting
 * - Project status tracking
 * 
 * @author Portfolio Admin
 */

const mongoose = require('mongoose');

// ============================================
// SCHEMA DEFINITION
// ============================================
const ProjectSchema = new mongoose.Schema({
    // Project title (displayed prominently on cards and detail page)
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    // Full project description (supports markdown/HTML)
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    // Brief description for project cards/previews
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    // Array of image URLs for project gallery
    images: [{
        type: String  // URLs to uploaded images
    }],
    // Main thumbnail image for project cards
    thumbnail: {
        type: String  // Primary display image
    },
    // YouTube video URL for project demo
    youtubeLink: {
        type: String,
        default: ''
    },
    // Live deployment URL
    liveDemoLink: {
        type: String,
        default: ''
    },
    // GitHub repository URL
    githubLink: {
        type: String,
        default: ''
    },
    // Technologies used in the project
    techStack: [{
        type: String,
        trim: true
    }],
    // Project category for filtering
    category: {
        type: String,
        enum: ['web', 'mobile', 'desktop', 'ai-ml', 'other'],
        default: 'web'
    },
    // Featured flag for highlighting on homepage
    featured: {
        type: Boolean,
        default: false
    },
    // Current project status
    status: {
        type: String,
        enum: ['completed', 'in-progress', 'archived'],
        default: 'completed'
    },
    // Display order (lower number = higher priority)
    order: {
        type: Number,
        default: 0
    },
    // Timestamp of project creation
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// INDEXES
// ============================================
// Compound index for efficient querying of featured projects sorted by date
ProjectSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
