import React, { useState, useEffect, useCallback } from 'react';
import { FiFolder } from 'react-icons/fi';
import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import { ProjectCardSkeleton } from '../components/common/Skeleton';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [categories, setCategories] = useState(['all', 'web', 'mobile', 'desktop', 'ai-ml', 'other']);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('project');
            if (response.data.data && response.data.data.length > 0) {
                const cats = ['all', ...response.data.data.map(cat =>
                    cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
                )];
                setCategories(cats);
            }
        } catch (err) {
            console.log('Using default categories');
        }
    };

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { category: filter } : {};
            const response = await projectsAPI.getAll(params);
            setProjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const labelFor = (category) =>
        category === 'all' ? 'All Projects' : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="section-ornament" />
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Projects</h1>
                            <p className="text-gray-400 text-base">
                                A collection of things I've designed and built.
                            </p>
                        </div>
                        {!loading && (
                            <span className="text-sm text-gray-500 pb-1">
                                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {categories.map((category) => {
                        const active = filter === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${active
                                    ? 'filter-pill-active text-white'
                                    : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 hover:bg-gray-800/40'
                                    }`}
                            >
                                {labelFor(category)}
                            </button>
                        );
                    })}
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {[1, 2, 3, 4, 5, 6].map(i => <ProjectCardSkeleton key={i} />)}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
                        <FiFolder className="text-gray-700 mx-auto mb-4" size={40} />
                        <p className="text-gray-400 text-base mb-1">No projects in this category yet</p>
                        <button
                            onClick={() => setFilter('all')}
                            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                        >
                            View all projects
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
