const mongoose = require('mongoose');

const currentWorkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    type: {
        type: String,
        enum: ['project', 'learning', 'research', 'other'],
        default: 'project'
    },
    category: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'testing', 'nearly-done'],
        default: 'in-progress'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    technologies: [{
        type: String
    }],
    image: {
        type: String
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expectedEndDate: {
        type: Date
    },
    links: [{
        title: String,
        url: String
    }],
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

currentWorkSchema.index({ order: 1 });
currentWorkSchema.index({ status: 1 });
currentWorkSchema.index({ isFeatured: -1, order: 1 });

module.exports = mongoose.model('CurrentWork', currentWorkSchema);
