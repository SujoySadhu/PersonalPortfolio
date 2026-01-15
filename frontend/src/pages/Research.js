import React, { useState, useEffect, useCallback } from 'react';
import { researchAPI, categoriesAPI } from '../services/api';
import ResearchCard from '../components/research/ResearchCard';
import Loading from '../components/common/Loading';

const Research = () => {
    const [research, setResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [types, setTypes] = useState(['all', 'journal', 'conference', 'thesis', 'preprint', 'other']);
    const [typeLabels, setTypeLabels] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('research');
            if (response.data.data && response.data.data.length > 0) {
                const cats = ['all', ...response.data.data.map(cat => 
                    cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
                )];
                const labels = { all: 'All Publications' };
                response.data.data.forEach(cat => {
                    const key = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                    labels[key] = `${cat.icon || ''} ${cat.name}`.trim();
                });
                setTypes(cats);
                setTypeLabels(labels);
            }
        } catch (err) {
            console.log('Using default types');
        }
    };

    const fetchResearch = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { type: filter } : {};
            const response = await researchAPI.getAll(params);
            setResearch(response.data.data || []);
        } catch (error) {
            console.error('Error fetching research:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchResearch();
    }, [fetchResearch]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Research & <span className="gradient-text">Publications</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        My academic contributions, research papers, and publications.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {types.map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                filter === type
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {typeLabels[type] || (type === 'all' ? 'All Publications' : type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                        </button>
                    ))}
                </div>

                {/* Research Grid */}
                {loading ? (
                    <Loading text="Loading publications..." />
                ) : research.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {research.map((item) => (
                            <ResearchCard key={item._id} research={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No publications found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Research;
