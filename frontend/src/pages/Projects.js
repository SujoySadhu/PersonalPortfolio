import React, { useState, useEffect, useCallback } from 'react';
import { projectsAPI, categoriesAPI } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import Loading from '../components/common/Loading';

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

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="section-ornament" />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Projects
                    </h1>
                    <p className="text-gray-400 text-base">
                        A collection of projects I've worked on.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filter === category
                                    ? 'filter-pill-active text-white'
                                    : 'text-gray-500 hover:text-white hover:bg-gray-800/40'
                                }`}
                        >
                            {category === 'all' ? 'All Projects' : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <Loading text="Loading projects..." />
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No projects found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
