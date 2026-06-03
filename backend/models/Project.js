const mongoose = require('mongoose');

// A single element on the free "slide canvas" (text box or image), positioned
// with percentages so it renders identically at any size.
const CanvasElementSchema = new mongoose.Schema({
    id: { type: String },
    type: { type: String },          // 'text' | 'image'
    x: { type: Number, default: 0 }, // % of canvas width
    y: { type: Number, default: 0 }, // % of canvas height
    w: { type: Number, default: 20 },
    h: { type: Number, default: 12 },
    // text element
    text: { type: String },
    fontSize: { type: Number },      // design points (rendered as cqw)
    fontFamily: { type: String },
    color: { type: String },
    bg: { type: String },
    align: { type: String },
    bold: { type: Boolean },
    italic: { type: Boolean },
    underline: { type: Boolean },
    // image element
    src: { type: String },
    fit: { type: String }
}, { _id: false });

const CanvasSchema = new mongoose.Schema({
    aspect: { type: Number },                       // legacy (pre width-relative model)
    height: { type: Number, default: 56.25 },       // canvas height as % of width
    version: { type: Number },
    bg: { type: String, default: '#ffffff' },
    elements: { type: [CanvasElementSchema], default: [] }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        default: ''
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot be more than 500 characters']
    },
    images: [{ type: String }],
    thumbnail: { type: String },
    // Resources: reports, slide decks, documents, etc. — referenced by a
    // shareable link (Google Drive, Dropbox, OneDrive, or any public URL).
    attachments: [{
        name: { type: String, trim: true },          // user-facing label e.g. "Project Report"
        url: { type: String },                         // shareable link to the resource
        format: { type: String },                      // type hint e.g. "pdf", "pptx", "link"
        bytes: { type: Number, default: 0 },           // file size in bytes (0 for links)
        uploadedAt: { type: Date, default: Date.now }
    }],
    // Free "slide canvas": images + text boxes placed anywhere (PowerPoint-like)
    canvas: { type: CanvasSchema, default: undefined },
    youtubeLink: { type: String, default: '' },
    liveDemoLink: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    techStack: [{
        name: { type: String, trim: true },
        // Free-form so any preset (Frontend, Graphics, Hardware, AI/ML…) or a
        // custom category typed in the editor is allowed.
        category: {
            type: String,
            trim: true,
            default: 'Tools'
        }
    }],
    category: {
        type: String,
        enum: ['web', 'mobile', 'desktop', 'ai-ml', 'other'],
        default: 'web'
    },
    featured: { type: Boolean, default: false },
    imageLayout: {
        type: String,
        enum: ['carousel', 'grid'],
        default: 'carousel'
    },
    status: {
        type: String,
        enum: ['completed', 'in-progress', 'archived'],
        default: 'completed'
    },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

ProjectSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
