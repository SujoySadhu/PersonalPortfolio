import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiExternalLink } from 'react-icons/fi';
import { projectsAPI, getImageUrl } from '../../services/api';
import Loading from '../../components/common/Loading';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        
        try {
            await projectsAPI.delete(id);
            setProjects(projects.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            const response = await projectsAPI.toggleFeatured(id);
            setProjects(projects.map(p => 
                p._id === id ? { ...p, featured: response.data.data.featured } : p
            ));
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading projects..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
                        <p className="text-gray-400">Add, edit, or remove your portfolio projects</p>
                    </div>
                    <Link to="/admin/projects/new" className="btn-primary flex items-center gap-2">
                        <FiPlus /> Add Project
                    </Link>
                </div>

                {/* Projects Table */}
                {projects.length > 0 ? (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-300">
                                    <tr>
                                        <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Project</th>
                                        <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Category</th>
                                        <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                                        <th className="text-center text-gray-400 text-sm font-medium px-6 py-4">Featured</th>
                                        <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {projects.map((project) => (
                                        <tr key={project._id} className="hover:bg-dark-200/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                        {project.thumbnail ? (
                                                            <img
                                                                src={getImageUrl(project.thumbnail)}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-600"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{project.title}</p>
                                                        <p className="text-gray-500 text-sm truncate max-w-xs">
                                                            {project.shortDescription || project.description?.substring(0, 50)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm capitalize">
                                                    {project.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    project.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : project.status === 'in-progress'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {project.status?.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(project._id)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        project.featured
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-gray-700 text-gray-500 hover:text-yellow-400'
                                                    }`}
                                                >
                                                    <FiStar size={18} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/projects/${project._id}`}
                                                        target="_blank"
                                                        className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-white transition-colors"
                                                    >
                                                        <FiExternalLink size={18} />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/projects/edit/${project._id}`}
                                                        className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-primary-400 transition-colors"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(project._id)}
                                                        className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-red-400 transition-colors"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <p className="text-gray-400 mb-4">No projects yet.</p>
                        <Link to="/admin/projects/new" className="btn-primary inline-flex items-center gap-2">
                            <FiPlus /> Add Your First Project
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProjects;
