import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiExternalLink, FiFileText } from 'react-icons/fi';
import { researchAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const AdminResearch = () => {
    const [research, setResearch] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResearch();
    }, []);

    const fetchResearch = async () => {
        try {
            const response = await researchAPI.getAll();
            setResearch(response.data.data || []);
        } catch (error) {
            console.error('Error fetching research:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this publication?')) return;

        try {
            await researchAPI.delete(id);
            setResearch(research.filter(r => r._id !== id));
        } catch (error) {
            console.error('Error deleting research:', error);
            alert('Failed to delete publication');
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            const response = await researchAPI.toggleFeatured(id);
            setResearch(research.map(r =>
                r._id === id ? { ...r, featured: response.data.data.featured } : r
            ));
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    const typeColors = {
        journal: 'bg-blue-500/20 text-blue-400',
        conference: 'bg-green-500/20 text-green-400',
        thesis: 'bg-purple-500/20 text-purple-400',
        preprint: 'bg-yellow-500/20 text-yellow-400',
        other: 'bg-gray-500/20 text-gray-400'
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading publications..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Research</h1>
                        <p className="text-gray-400">Add, edit, or remove your publications</p>
                    </div>
                    <Link to="/admin/research/new" className="btn-primary flex items-center gap-2">
                        <FiPlus /> Add Publication
                    </Link>
                </div>

                {/* Research List */}
                {research.length > 0 ? (
                    <div className="space-y-4">
                        {research.map((item) => (
                            <div key={item._id} className="card p-6 hover:border-primary-500/50 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[item.type]}`}>
                                                {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                                            </span>
                                            {item.featured && (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                                        {item.authors && item.authors.length > 0 && (
                                            <p className="text-sm text-gray-400 mb-2">
                                                {item.authors.join(', ')}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {item.journalName || item.conferenceName}
                                            {item.publicationDate && (
                                                <span> • {new Date(item.publicationDate).getFullYear()}</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleFeatured(item._id)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                item.featured
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-gray-700 text-gray-500 hover:text-yellow-400'
                                            }`}
                                        >
                                            <FiStar size={18} />
                                        </button>
                                        {item.pdfLink && (
                                            <a
                                                href={item.pdfLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-white"
                                            >
                                                <FiFileText size={18} />
                                            </a>
                                        )}
                                        {item.doiLink && (
                                            <a
                                                href={item.doiLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-white"
                                            >
                                                <FiExternalLink size={18} />
                                            </a>
                                        )}
                                        <Link
                                            to={`/admin/research/edit/${item._id}`}
                                            className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-primary-400"
                                        >
                                            <FiEdit2 size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:text-red-400"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <p className="text-gray-400 mb-4">No publications yet.</p>
                        <Link to="/admin/research/new" className="btn-primary inline-flex items-center gap-2">
                            <FiPlus /> Add Your First Publication
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminResearch;
