import React, { useState, useEffect } from 'react';
import { FiAward, FiFilter } from 'react-icons/fi';
import { achievementsAPI, categoriesAPI } from '../services/api';
import AchievementCard from '../components/achievements/AchievementCard';
import Spinner from '../components/common/Spinner';

// Fallback categories
const defaultCategories = [
    { value: 'all', label: 'All' },
    { value: 'competition', label: '🏆 Competitions' },
    { value: 'certification', label: '📜 Certifications' },
    { value: 'award', label: '🎖️ Awards' },
    { value: 'publication', label: '📚 Publications' },
    { value: 'hackathon', label: '💻 Hackathons' },
    { value: 'scholarship', label: '🎓 Scholarships' },
    { value: 'other', label: '⭐ Other' }
];

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [filteredAchievements, setFilteredAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(defaultCategories);

    useEffect(() => {
        fetchCategories();
        fetchAchievements();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredAchievements(achievements);
        } else {
            setFilteredAchievements(achievements.filter(a => a.category === selectedCategory));
        }
    }, [selectedCategory, achievements]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('achievement');
            if (response.data.data && response.data.data.length > 0) {
                const cats = [
                    { value: 'all', label: 'All' },
                    ...response.data.data.map(cat => ({
                        value: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                        label: `${cat.icon} ${cat.name}s`
                    }))
                ];
                setCategories(cats);
            }
        } catch (err) {
            console.log('Using default categories');
        }
    };

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await achievementsAPI.getAll();
            setAchievements(response.data.data);
            setFilteredAchievements(response.data.data);
        } catch (err) {
            setError('Failed to load achievements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get counts for each category
    const getCategoryCounts = () => {
        const counts = { all: achievements.length };
        categories.forEach(cat => {
            if (cat.value !== 'all') {
                counts[cat.value] = achievements.filter(a => a.category === cat.value).length;
            }
        });
        return counts;
    };

    const counts = getCategoryCounts();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-100 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-100 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl mb-6">
                        <FiAward className="text-white text-3xl" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Achievements & Awards
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Milestones, recognitions, and accomplishments throughout my journey in technology and academics.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-primary-400 mb-1">{counts.all}</div>
                        <div className="text-gray-400 text-sm">Total Achievements</div>
                    </div>
                    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{counts.competition || 0}</div>
                        <div className="text-gray-400 text-sm">Competitions</div>
                    </div>
                    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">{counts.certification || 0}</div>
                        <div className="text-gray-400 text-sm">Certifications</div>
                    </div>
                    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-1">{counts.award || 0}</div>
                        <div className="text-gray-400 text-sm">Awards</div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <FiFilter size={18} />
                        <span className="font-medium">Filter by Category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedCategory === category.value
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-gray-700'
                                }`}
                            >
                                {category.label}
                                {counts[category.value] > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        selectedCategory === category.value
                                            ? 'bg-white/20'
                                            : 'bg-gray-700'
                                    }`}>
                                        {counts[category.value]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Achievements Grid */}
                {filteredAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAchievements.map(achievement => (
                            <AchievementCard key={achievement._id} achievement={achievement} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Achievements Found</h3>
                        <p className="text-gray-400">
                            {selectedCategory !== 'all' 
                                ? `No achievements in the "${selectedCategory}" category yet.`
                                : 'No achievements have been added yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
