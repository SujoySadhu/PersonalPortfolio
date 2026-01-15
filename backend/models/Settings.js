const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: 'Your Name'
    },
    title: {
        type: String,
        default: 'Full Stack Developer'
    },
    tagline: {
        type: String,
        default: 'I build things for the web.'
    },
    bio: {
        type: String,
        default: 'I\'m a full-stack developer specializing in building exceptional digital experiences. Currently, I\'m focused on building accessible, human-centered products.'
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    resumeLink: {
        type: String,
        default: ''
    },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' },
        codeforces: { type: String, default: '' },
        leetcode: { type: String, default: '' },
        codechef: { type: String, default: '' },
        hackerrank: { type: String, default: '' }
    },
    isAvailableForHire: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);
