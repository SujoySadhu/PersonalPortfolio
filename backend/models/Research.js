const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide research title'],
        trim: true
    },
    abstract: {
        type: String,
        required: [true, 'Please provide an abstract']
    },
    authors: [{
        type: String,
        trim: true
    }],
    journalName: {
        type: String,
        trim: true
    },
    conferenceName: {
        type: String,
        trim: true
    },
    publicationDate: {
        type: Date
    },
    pdfLink: {
        type: String,
        default: ''
    },
    doiLink: {
        type: String,
        default: ''
    },
    citations: {
        type: Number,
        default: 0
    },
    keywords: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['journal', 'conference', 'thesis', 'preprint', 'other'],
        default: 'journal'
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Research', ResearchSchema);
