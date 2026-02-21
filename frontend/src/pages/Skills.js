import React, { useState, useEffect } from 'react';
import { skillsAPI, categoriesAPI } from '../services/api';
import SkillCard from '../components/skills/SkillCard';
import Loading from '../components/common/Loading';
import {
    FiCode, FiDatabase, FiServer, FiTool,
    FiLayers, FiTerminal, FiGlobe, FiCpu
} from 'react-icons/fi';

const categoryIconMap = {
    frontend: FiGlobe,
    backend: FiServer,
    database: FiDatabase,
    devops: FiTerminal,
    tools: FiTool,
    languages: FiCode,
    frameworks: FiLayers,
    'ai-ml': FiCpu,
    other: FiCpu,
};

const categoryColorMap = {
    frontend: 'text-blue-400 bg-blue-500/10',
    backend: 'text-emerald-400 bg-emerald-500/10',
    database: 'text-violet-400 bg-violet-500/10',
    devops: 'text-orange-400 bg-orange-500/10',
    tools: 'text-cyan-400 bg-cyan-500/10',
    languages: 'text-indigo-400 bg-indigo-500/10',
    frameworks: 'text-teal-400 bg-teal-500/10',
    'ai-ml': 'text-pink-400 bg-pink-500/10',
    other: 'text-gray-400 bg-gray-500/10',
};

const Skills = () => {
    const [skills, setSkills] = useState({});
    const [loading, setLoading] = useState(true);
    const [categoryLabels, setCategoryLabels] = useState({
        frontend: 'Frontend',
        backend: 'Backend',
        database: 'Database',
        devops: 'DevOps',
        tools: 'Tools',
        languages: 'Languages',
        frameworks: 'Frameworks',
        'ai-ml': 'AI / ML',
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
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Skills & Technologies
                    </h1>
                    <p className="text-gray-400 text-base">
                        A comprehensive overview of my technical skills and expertise.
                    </p>
                    {!loading && totalSkills > 0 && (
                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categoryEntries.map(([category, categorySkills]) => {
                            const Icon = categoryIconMap[category] || FiCode;
                            const colorClasses = categoryColorMap[category] || 'text-gray-400 bg-gray-500/10';
                            const label = categoryLabels[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                            return (
                                <div key={category} className="bg-dark-100 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-sm">{label}</h3>
                                            <span className="text-gray-500 text-xs">{categorySkills.length} skills</span>
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
