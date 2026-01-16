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
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        My <span className="gradient-text">Projects</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A collection of projects I've worked on, ranging from web applications to AI solutions.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                filter === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-100 text-gray-400 hover:bg-gray-700 hover:text-white'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
