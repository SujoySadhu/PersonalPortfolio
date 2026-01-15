import React, { useState, useEffect } from 'react';
import { FiHeart, FiExternalLink } from 'react-icons/fi';
import { interestsAPI, categoriesAPI } from '../services/api';
import Spinner from '../components/common/Spinner';

const Interests = () => {
    const [interests, setInterests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interestsRes, categoriesRes] = await Promise.all([
                interestsAPI.getAll({ active: 'true' }),
                categoriesAPI.getBySection('interest')
            ]);
            setInterests(interestsRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInterests = selectedCategory === 'all' 
        ? interests 
        : interests.filter(i => i.category === selectedCategory);

    return (
        <div className="min-h-screen bg-dark-200 py-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FiHeart className="w-8 h-8 text-primary-400" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            My Interests
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Things I'm passionate about and love to explore in my free time
                    </p>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 text-gray-400 hover:bg-dark-300 hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-2 rounded-full font-medium transition-all ${
                                    selectedCategory === cat.name
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-dark-100 text-gray-400 hover:bg-dark-300 hover:text-white'
                                }`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : filteredInterests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💭</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No interests found
                        </h3>
                        <p className="text-gray-400">Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInterests.map((interest) => (
                            <div
                                key={interest._id}
                                className="bg-dark-100 rounded-xl overflow-hidden border border-gray-800 hover:border-primary-500/50 transition-all duration-300 group"
                            >
                                {interest.image && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={`${API_URL}${interest.image}`}
                                            alt={interest.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <span className="text-4xl">{interest.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                                {interest.title}
                                            </h3>
                                            {interest.category && (
                                                <span className="inline-block px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-xs mb-3">
                                                    {interest.category}
                                                </span>
                                            )}
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {interest.description}
                                            </p>
                                        </div>
                                    </div>

                                    {interest.links && interest.links.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-800">
                                            <div className="flex flex-wrap gap-2">
                                                {interest.links.map((link, index) => (
                                                    <a
                                                        key={index}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-dark-200 text-gray-300 rounded-full text-sm hover:bg-primary-600 hover:text-white transition-colors"
                                                    >
                                                        <FiExternalLink className="w-3 h-3" />
                                                        {link.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Interests;
