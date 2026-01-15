const Category = require('../models/Category');

// @desc    Get all categories (optionally filter by section)
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const { section, active } = req.query;
        
        let query = {};
        if (section) {
            query.section = section;
        }
        if (active === 'true') {
            query.isActive = true;
        }

        const categories = await Category.find(query).sort({ order: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, section, icon, color, description, order } = req.body;

        // Check for duplicate in same section
        const existing = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            section 
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists in this section'
            });
        }

        const category = await Category.create({
            name,
            section,
            icon: icon || '📁',
            color: color || 'from-gray-500 to-slate-500',
            description,
            order: order || 0
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const { name, section, icon, color, description, order, isActive } = req.body;

        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check for duplicate if name is being changed
        if (name && name !== category.name) {
            const existing = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                section: section || category.section,
                _id: { $ne: req.params.id }
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists in this section'
                });
            }
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, section, icon, color, description, order, isActive },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Toggle category active status
// @route   PUT /api/categories/:id/toggle
// @access  Private (Admin)
exports.toggleCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Seed default categories
// @route   POST /api/categories/seed
// @access  Private (Admin)
exports.seedCategories = async (req, res) => {
    try {
        const defaultCategories = [
            // Project categories
            { name: 'Web Development', section: 'project', icon: '🌐', color: 'from-blue-500 to-cyan-500', order: 1 },
            { name: 'Mobile App', section: 'project', icon: '📱', color: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'Machine Learning', section: 'project', icon: '🤖', color: 'from-purple-500 to-violet-500', order: 3 },
            { name: 'Data Science', section: 'project', icon: '📊', color: 'from-orange-500 to-amber-500', order: 4 },
            { name: 'DevOps', section: 'project', icon: '⚙️', color: 'from-gray-500 to-slate-500', order: 5 },
            { name: 'Other', section: 'project', icon: '📁', color: 'from-gray-500 to-slate-500', order: 99 },

            // Skill categories
            { name: 'Frontend', section: 'skill', icon: '🎨', color: 'from-blue-500 to-cyan-500', order: 1 },
            { name: 'Backend', section: 'skill', icon: '⚙️', color: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'Database', section: 'skill', icon: '🗄️', color: 'from-purple-500 to-violet-500', order: 3 },
            { name: 'DevOps', section: 'skill', icon: '🚀', color: 'from-orange-500 to-amber-500', order: 4 },
            { name: 'Tools', section: 'skill', icon: '🔧', color: 'from-pink-500 to-rose-500', order: 5 },
            { name: 'Languages', section: 'skill', icon: '💻', color: 'from-indigo-500 to-blue-500', order: 6 },
            { name: 'Other', section: 'skill', icon: '📦', color: 'from-gray-500 to-slate-500', order: 99 },

            // Research categories
            { name: 'Journal Article', section: 'research', icon: '📄', color: 'from-blue-500 to-cyan-500', order: 1 },
            { name: 'Conference Paper', section: 'research', icon: '🎤', color: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'Book Chapter', section: 'research', icon: '📚', color: 'from-purple-500 to-violet-500', order: 3 },
            { name: 'Thesis', section: 'research', icon: '🎓', color: 'from-yellow-500 to-amber-500', order: 4 },
            { name: 'Patent', section: 'research', icon: '💡', color: 'from-orange-500 to-red-500', order: 5 },
            { name: 'Working Paper', section: 'research', icon: '📝', color: 'from-pink-500 to-rose-500', order: 6 },
            { name: 'Other', section: 'research', icon: '📁', color: 'from-gray-500 to-slate-500', order: 99 },

            // Achievement categories
            { name: 'Competition', section: 'achievement', icon: '🏆', color: 'from-blue-500 to-cyan-500', order: 1 },
            { name: 'Certification', section: 'achievement', icon: '📜', color: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'Award', section: 'achievement', icon: '🎖️', color: 'from-yellow-500 to-amber-500', order: 3 },
            { name: 'Publication', section: 'achievement', icon: '📚', color: 'from-purple-500 to-violet-500', order: 4 },
            { name: 'Hackathon', section: 'achievement', icon: '💻', color: 'from-red-500 to-orange-500', order: 5 },
            { name: 'Scholarship', section: 'achievement', icon: '🎓', color: 'from-pink-500 to-rose-500', order: 6 },
            { name: 'Other', section: 'achievement', icon: '⭐', color: 'from-gray-500 to-slate-500', order: 99 },

            // Blog categories
            { name: 'Tutorial', section: 'blog', icon: '📖', color: 'from-blue-500 to-cyan-500', order: 1 },
            { name: 'Technology', section: 'blog', icon: '💻', color: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'Career', section: 'blog', icon: '🚀', color: 'from-purple-500 to-violet-500', order: 3 },
            { name: 'Personal', section: 'blog', icon: '✨', color: 'from-pink-500 to-rose-500', order: 4 },
            { name: 'Thoughts', section: 'blog', icon: '💭', color: 'from-yellow-500 to-amber-500', order: 5 },
            { name: 'News', section: 'blog', icon: '📰', color: 'from-red-500 to-orange-500', order: 6 },
            { name: 'Other', section: 'blog', icon: '📝', color: 'from-gray-500 to-slate-500', order: 99 }
        ];

        // Only add categories that don't exist
        let added = 0;
        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name, section: cat.section });
            if (!exists) {
                await Category.create(cat);
                added++;
            }
        }

        const categories = await Category.find().sort({ section: 1, order: 1 });

        res.status(200).json({
            success: true,
            message: `Seeded ${added} new categories`,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
