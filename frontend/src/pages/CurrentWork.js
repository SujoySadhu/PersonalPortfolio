import React, { useState, useEffect } from 'react';
import { FiCode, FiClock, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { currentWorkAPI, getImageUrl } from '../services/api';
import Spinner from '../components/common/Spinner';

const CurrentWork = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');

    const typeOptions = [
        { value: 'all', label: 'All', icon: '📋' },
        { value: 'project', label: 'Projects', icon: '🚀' },
        { value: 'learning', label: 'Learning', icon: '📚' },
        { value: 'research', label: 'Research', icon: '🔬' },
        { value: 'other', label: 'Other', icon: '📦' }
    ];

    const statusConfig = {
        'planning': { label: 'Planning', color: 'bg-blue-500', textColor: 'text-blue-400' },
        'in-progress': { label: 'In Progress', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
        'testing': { label: 'Testing', color: 'bg-purple-500', textColor: 'text-purple-400' },
        'nearly-done': { label: 'Nearly Done', color: 'bg-green-500', textColor: 'text-green-400' }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const worksRes = await currentWorkAPI.getAll({ active: 'true' });
            setWorks(worksRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorks = selectedType === 'all' 
        ? works 
        : works.filter(w => w.type === selectedType);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-dark-200 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FiCode className="w-8 h-8 text-primary-400" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Currently Working On
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Projects, learning goals, and initiatives I'm actively pursuing
                    </p>
                </div>

                {/* Type Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {typeOptions.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                selectedType === type.value
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 text-gray-400 hover:bg-dark-300 hover:text-white'
                            }`}
                        >
                            {type.icon} {type.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : filteredWorks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔧</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No active work items
                        </h3>
                        <p className="text-gray-400">Check back soon for updates!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredWorks.map((work) => (
                            <div
                                key={work._id}
                                className={`bg-dark-100 rounded-xl overflow-hidden border ${
                                    work.isFeatured ? 'border-primary-500' : 'border-gray-800'
                                } hover:border-primary-500/50 transition-all duration-300`}
                            >
                                <div className="md:flex">
                                    {work.image && (
                                        <div className="md:w-64 flex-shrink-0">
                                            <img
                                                src={getImageUrl(work.image)}
                                                alt={work.title}
                                                className="w-full h-48 md:h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {work.isFeatured && (
                                                        <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 ${statusConfig[work.status]?.color || 'bg-gray-500'} text-white text-xs rounded-full`}>
                                                        {statusConfig[work.status]?.label || work.status}
                                                    </span>
                                                    {work.category && (
                                                        <span className="px-2 py-1 bg-dark-200 text-gray-400 text-xs rounded-full">
                                                            {work.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-bold text-white">
                                                    {work.title}
                                                </h3>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-4">
                                                {work.startDate && (
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar className="w-4 h-4" />
                                                        Started {formatDate(work.startDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-400 mb-4 leading-relaxed">
                                            {work.description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-400">Progress</span>
                                                <span className={statusConfig[work.status]?.textColor || 'text-gray-400'}>
                                                    {work.progress}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${statusConfig[work.status]?.color || 'bg-primary-500'} transition-all duration-500`}
                                                    style={{ width: `${work.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Technologies */}
                                        {work.technologies && work.technologies.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {work.technologies.map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-dark-200 text-gray-300 rounded-full text-sm"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Links */}
                                        {work.links && work.links.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {work.links.map((link, index) => (
                                                    <a
                                                        key={index}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm hover:bg-primary-600 hover:text-white transition-colors"
                                                    >
                                                        <FiExternalLink className="w-3 h-3" />
                                                        {link.title}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Expected End Date */}
                                        {work.expectedEndDate && (
                                            <div className="mt-4 pt-4 border-t border-gray-800">
                                                <span className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FiClock className="w-4 h-4" />
                                                    Expected completion: {formatDate(work.expectedEndDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentWork;
