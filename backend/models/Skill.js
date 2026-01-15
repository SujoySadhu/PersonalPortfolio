const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide skill name'],
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Please provide skill category'],
        enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'other'],
        default: 'other'
    },
    proficiency: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    icon: {
        type: String, // Icon name or URL
        default: ''
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

module.exports = mongoose.model('Skill', SkillSchema);
