import React, { useState, useEffect } from 'react';
import { skillsAPI, categoriesAPI } from '../services/api';
import SkillCard from '../components/skills/SkillCard';
import Loading from '../components/common/Loading';

const Skills = () => {
    const [skills, setSkills] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [categories, setCategories] = useState(['all', 'frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'other']);
    const [categoryLabels, setCategoryLabels] = useState({
        all: 'All Skills',
        frontend: 'Frontend',
        backend: 'Backend',
        database: 'Database',
        devops: 'DevOps',
        tools: 'Tools',
        languages: 'Languages',
        frameworks: 'Frameworks',
        other: 'Other'
    });

    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('skill');
            if (response.data.data && response.data.data.length > 0) {
                const cats = ['all', ...response.data.data.map(cat => 
                    cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
                )];
                const labels = { all: 'All Skills' };
                response.data.data.forEach(cat => {
                    const key = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                    labels[key] = `${cat.icon || ''} ${cat.name}`.trim();
                });
                setCategories(cats);
                setCategoryLabels(labels);
            }
        } catch (err) {
            console.log('Using default categories');
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await skillsAPI.getAll();
            setSkills(response.data.grouped || {});
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredSkills = () => {
        if (activeTab === 'all') {
            return Object.values(skills).flat();
        }
        return skills[activeTab] || [];
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Skills & <span className="gradient-text">Technologies</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A comprehensive overview of my technical skills and expertise across various domains.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {categoryLabels[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                {loading ? (
                    <Loading text="Loading skills..." />
                ) : getFilteredSkills().length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {getFilteredSkills().map((skill) => (
                            <SkillCard key={skill._id} skill={skill} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No skills found in this category.</p>
                    </div>
                )}

                {/* Skills Summary */}
                {!loading && Object.keys(skills).length > 0 && activeTab === 'all' && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">Skills by Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(skills).map(([category, categorySkills]) => (
                                <div key={category} className="card p-4 text-center">
                                    <div className="text-3xl font-bold gradient-text mb-2">
                                        {categorySkills.length}
                                    </div>
                                    <div className="text-gray-400 capitalize">{category}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skills;
