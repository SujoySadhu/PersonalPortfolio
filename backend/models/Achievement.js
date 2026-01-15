const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        enum: ['competition', 'certification', 'award', 'publication', 'hackathon', 'scholarship', 'other'],
        default: 'award'
    },
    date: {
        type: Date
    },
    issuer: {
        type: String,
        trim: true
    },
    credentialLink: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    position: {
        type: String,
        trim: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Achievement', AchievementSchema);
