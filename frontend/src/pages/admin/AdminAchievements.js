import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiAward, FiExternalLink, FiSearch } from 'react-icons/fi';
import { achievementsAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const categoryColors = {
    competition: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    certification: 'bg-green-500/20 text-green-400 border-green-500/30',
    award: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    publication: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    hackathon: 'bg-red-500/20 text-red-400 border-red-500/30',
    scholarship: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const categoryIcons = {
    competition: '🏆',
    certification: '📜',
    award: '🎖️',
    publication: '📚',
    hackathon: '💻',
    scholarship: '🎓',
    other: '⭐'
};

const AdminAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [filteredAchievements, setFilteredAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    useEffect(() => {
        let filtered = achievements;
        
        if (searchTerm) {
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.issuer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterCategory !== 'all') {
            filtered = filtered.filter(a => a.category === filterCategory);
        }
        
        setFilteredAchievements(filtered);
    }, [searchTerm, filterCategory, achievements]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await achievementsAPI.getAll();
            setAchievements(response.data.data);
            setFilteredAchievements(response.data.data);
        } catch (err) {
            setError('Failed to load achievements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await achievementsAPI.toggleFeatured(id);
            fetchAchievements();
        } catch (err) {
            console.error('Failed to toggle featured status:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await achievementsAPI.delete(id);
            setDeleteConfirm(null);
            fetchAchievements();
        } catch (err) {
            console.error('Failed to delete achievement:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FiAward className="text-primary-500" />
                        Manage Achievements
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {achievements.length} total achievement{achievements.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    to="/admin/achievements/new"
                    className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <FiPlus size={18} />
                    Add Achievement
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search achievements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                    <option value="all">All Categories</option>
                    <option value="competition">🏆 Competition</option>
                    <option value="certification">📜 Certification</option>
                    <option value="award">🎖️ Award</option>
                    <option value="publication">📚 Publication</option>
                    <option value="hackathon">💻 Hackathon</option>
                    <option value="scholarship">🎓 Scholarship</option>
                    <option value="other">⭐ Other</option>
                </select>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Achievements Table */}
            {filteredAchievements.length > 0 ? (
                <div className="bg-dark-200 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-dark-300 border-b border-gray-700">
                                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Achievement</th>
                                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Category</th>
                                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Date</th>
                                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Featured</th>
                                    <th className="text-right text-gray-400 font-medium px-6 py-4 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredAchievements.map((achievement) => (
                                    <tr key={achievement._id} className="hover:bg-dark-300/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {achievement.image ? (
                                                    <img
                                                        src={achievement.image.startsWith('http') ? achievement.image : `${API_URL}${achievement.image}`}
                                                        alt={achievement.title}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                                                        {categoryIcons[achievement.category] || '⭐'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-white font-medium line-clamp-1">
                                                        {achievement.title}
                                                    </h3>
                                                    {achievement.issuer && (
                                                        <p className="text-gray-400 text-sm line-clamp-1">
                                                            {achievement.issuer}
                                                        </p>
                                                    )}
                                                    {achievement.position && (
                                                        <p className="text-primary-400 text-xs">
                                                            {achievement.position}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[achievement.category] || categoryColors.other}`}>
                                                {categoryIcons[achievement.category]} {achievement.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {formatDate(achievement.date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleFeatured(achievement._id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    achievement.featured
                                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                }`}
                                                title={achievement.featured ? 'Remove from featured' : 'Mark as featured'}
                                            >
                                                <FiStar size={18} fill={achievement.featured ? 'currentColor' : 'none'} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {achievement.credentialLink && (
                                                    <a
                                                        href={achievement.credentialLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-dark-300 rounded-lg transition-colors"
                                                        title="View Credential"
                                                    >
                                                        <FiExternalLink size={18} />
                                                    </a>
                                                )}
                                                <Link
                                                    to={`/admin/achievements/edit/${achievement._id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-300 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(achievement._id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-300 rounded-lg transition-colors"
                                                    title="Delete"
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
                <div className="text-center py-16 bg-dark-200 rounded-xl border border-gray-800">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Achievements Found</h3>
                    <p className="text-gray-400 mb-6">
                        {searchTerm || filterCategory !== 'all' 
                            ? 'No achievements match your search criteria.'
                            : 'Start by adding your first achievement.'}
                    </p>
                    <Link
                        to="/admin/achievements/new"
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiPlus size={18} />
                        Add Achievement
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Delete Achievement?</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete this achievement? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAchievements;
