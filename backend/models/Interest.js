const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    icon: {
        type: String,
        default: '💡'
    },
    category: {
        type: String,
        default: 'General'
    },
    image: {
        type: String
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
    }
}, {
    timestamps: true
});

interestSchema.index({ order: 1 });
interestSchema.index({ category: 1 });

module.exports = mongoose.model('Interest', interestSchema);
