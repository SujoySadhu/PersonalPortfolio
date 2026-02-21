const Settings = require('../models/Settings');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Research = require('../models/Research');
const Achievement = require('../models/Achievement');
const Blog = require('../models/Blog');
const Interest = require('../models/Interest');
const CurrentWork = require('../models/CurrentWork');

exports.getHomeData = async (req, res) => {
    try {
        const [settings, projects, skills, research, achievements, blogs, interests, currentWork] = await Promise.all([
            Settings.findOne().lean(),
            Project.find({ featured: true }).sort({ order: 1, createdAt: -1 }).limit(3).lean(),
            Skill.find().sort({ order: 1 }).limit(8).lean(),
            Research.find({ featured: true }).sort({ createdAt: -1 }).limit(3).lean(),
            Achievement.find({ featured: true }).sort({ date: -1 }).limit(3).lean(),
            Blog.find({ featured: true, published: true }).sort({ createdAt: -1 }).limit(3).lean(),
            Interest.find({ isActive: true }).sort({ order: 1 }).limit(4).lean(),
            CurrentWork.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 }).limit(3).lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                settings: settings || {},
                featuredProjects: projects || [],
                skills: skills || [],
                research: research || [],
                achievements: achievements || [],
                blogs: blogs || [],
                interests: interests || [],
                currentWork: currentWork || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne().lean();
        res.status(200).json({ success: true, data: settings || {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
