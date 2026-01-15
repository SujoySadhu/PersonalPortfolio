const mongoose = require('mongoose');
const Category = require('./models/Category');

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
    { name: 'Other', section: 'blog', icon: '📝', color: 'from-gray-500 to-slate-500', order: 99 },

    // Interest categories
    { name: 'Technology', section: 'interest', icon: '💻', color: 'from-blue-500 to-cyan-500', order: 1 },
    { name: 'Gaming', section: 'interest', icon: '🎮', color: 'from-purple-500 to-violet-500', order: 2 },
    { name: 'Music', section: 'interest', icon: '🎵', color: 'from-pink-500 to-rose-500', order: 3 },
    { name: 'Reading', section: 'interest', icon: '📚', color: 'from-green-500 to-emerald-500', order: 4 },
    { name: 'Travel', section: 'interest', icon: '✈️', color: 'from-cyan-500 to-blue-500', order: 5 },
    { name: 'Sports', section: 'interest', icon: '⚽', color: 'from-orange-500 to-amber-500', order: 6 },
    { name: 'Photography', section: 'interest', icon: '📷', color: 'from-indigo-500 to-blue-500', order: 7 },
    { name: 'Art', section: 'interest', icon: '🎨', color: 'from-red-500 to-pink-500', order: 8 },
    { name: 'Cooking', section: 'interest', icon: '🍳', color: 'from-yellow-500 to-amber-500', order: 9 },
    { name: 'Other', section: 'interest', icon: '💡', color: 'from-gray-500 to-slate-500', order: 99 },

    // Current Work categories
    { name: 'Side Project', section: 'currentwork', icon: '🚀', color: 'from-blue-500 to-cyan-500', order: 1 },
    { name: 'Learning', section: 'currentwork', icon: '📖', color: 'from-green-500 to-emerald-500', order: 2 },
    { name: 'Research', section: 'currentwork', icon: '🔬', color: 'from-purple-500 to-violet-500', order: 3 },
    { name: 'Open Source', section: 'currentwork', icon: '🌐', color: 'from-orange-500 to-amber-500', order: 4 },
    { name: 'Course', section: 'currentwork', icon: '🎓', color: 'from-pink-500 to-rose-500', order: 5 },
    { name: 'Client Work', section: 'currentwork', icon: '💼', color: 'from-indigo-500 to-blue-500', order: 6 },
    { name: 'Other', section: 'currentwork', icon: '⚙️', color: 'from-gray-500 to-slate-500', order: 99 }
];

async function seedCategories() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/my_portfolio');
        console.log('Connected to MongoDB');

        let added = 0;
        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name, section: cat.section });
            if (!exists) {
                await Category.create(cat);
                added++;
                console.log(`Added: ${cat.name} (${cat.section})`);
            }
        }

        console.log(`\nSeeded ${added} new categories`);
        const total = await Category.countDocuments();
        console.log(`Total categories in database: ${total}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
