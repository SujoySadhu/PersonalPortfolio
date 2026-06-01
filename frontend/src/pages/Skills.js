import React, { useState, useEffect } from 'react';
import { skillsAPI, categoriesAPI } from '../services/api';
import SkillCard from '../components/skills/SkillCard';
import Loading from '../components/common/Loading';
import { FiCode } from 'react-icons/fi';
import { getSkillCategory } from '../config/skillCategories';

const Skills = () => {
    const [skills, setSkills] = useState({});
    const [loading, setLoading] = useState(true);
    const [categoryLabels, setCategoryLabels] = useState({});

    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('skill');
            if (response.data.data && response.data.data.length > 0) {
                const labels = {};
                response.data.data.forEach(cat => {
                    const key = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                    labels[key] = cat.name;
                });
                setCategoryLabels(prev => ({ ...prev, ...labels }));
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

    const totalSkills = Object.values(skills).flat().length;
    const categoryEntries = Object.entries(skills).filter(([, list]) => list.length > 0);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="section-ornament" />
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Skills &amp; Technologies
                    </h1>
                    <p className="text-gray-400 text-base">
                        A comprehensive overview of my technical skills and expertise.
                    </p>
                    {!loading && totalSkills > 0 && (
                        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                            <span>{totalSkills} skills</span>
                            <span>·</span>
                            <span>{categoryEntries.length} categories</span>
                        </div>
                    )}
                </div>

                {/* Skills by Category */}
                {loading ? (
                    <Loading text="Loading skills..." />
                ) : categoryEntries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                        {categoryEntries.map(([category, categorySkills]) => {
                            const cfg = getSkillCategory(category);
                            const Icon = cfg.Icon;
                            const label = categoryLabels[category] || cfg.label;

                            return (
                                <div key={category} className="bg-dark-100 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-800/40">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.text} ${cfg.bg}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-sm">{label}</h3>
                                            <span className="text-gray-500 text-xs">
                                                {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-800/40">
                                        {categorySkills.map(skill => (
                                            <SkillCard key={skill._id} skill={skill} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FiCode className="text-gray-700 mx-auto mb-3" size={32} />
                        <p className="text-gray-400 text-lg">No skills added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skills;
