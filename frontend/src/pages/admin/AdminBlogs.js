import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import { blogsAPI, getImageUrl } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, published, draft
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filter]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: 10
            };
            
            if (filter === 'published') params.published = 'true';
            else if (filter === 'draft') params.published = 'false';
            
            if (searchTerm) params.search = searchTerm;

            const response = await blogsAPI.getAll(params);
            setBlogs(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination?.totalPages || 1,
                total: response.data.pagination?.total || 0
            }));
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBlogs();
    };

    const handleDelete = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await blogsAPI.delete(id);
                toast.success('Blog deleted successfully');
                fetchBlogs();
            } catch (error) {
                console.error('Error deleting blog:', error);
                toast.error('Failed to delete blog');
            }
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await blogsAPI.togglePublish(id);
            toast.success(currentStatus ? 'Blog unpublished' : 'Blog published');
            fetchBlogs();
        } catch (error) {
            console.error('Error toggling publish status:', error);
            toast.error('Failed to update blog');
        }
    };

    const handleToggleFeatured = async (id, currentStatus) => {
        try {
            await blogsAPI.toggleFeatured(id);
            toast.success(currentStatus ? 'Removed from featured' : 'Added to featured');
            fetchBlogs();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error('Failed to update blog');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-gray-600">Manage your blog articles</p>
                </div>
                <Link
                    to="/admin/blogs/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    New Post
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2">
                        {['all', 'published', 'draft'].map((f) => (
                            <button
                                key={f}
                                onClick={() => {
                                    setFilter(f);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
                    <div className="text-gray-600">Total Posts</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {blogs.filter(b => b.published).length}
                    </div>
                    <div className="text-gray-600">Published</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                        {blogs.filter(b => !b.published).length}
                    </div>
                    <div className="text-gray-600">Drafts</div>
                </div>
            </div>

            {/* Blog List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
                    <p className="text-gray-600 mb-4">Start writing your first article!</p>
                    <Link
                        to="/admin/blogs/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <FiPlus className="w-5 h-5" />
                        Create Post
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Post
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {blogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    {blog.coverImage ? (
                                                        <img
                                                            src={getImageUrl(blog.coverImage)}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xl">📝</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 truncate max-w-xs">
                                                        {blog.title}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <FiCalendar className="w-3 h-3" />
                                                            {formatDate(blog.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FiClock className="w-3 h-3" />
                                                            {blog.readTime} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {blog.category && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                                    {blog.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FiEye className="w-4 h-4" />
                                                {blog.views} views
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    blog.published 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {blog.published ? 'Published' : 'Draft'}
                                                </span>
                                                {blog.featured && (
                                                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleTogglePublish(blog._id, blog.published)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        blog.published
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                    title={blog.published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {blog.published ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFeatured(blog._id, blog.featured)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        blog.featured
                                                            ? 'text-yellow-500 hover:bg-yellow-50'
                                                            : 'text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                    title={blog.featured ? 'Remove from featured' : 'Add to featured'}
                                                >
                                                    <FiStar className={`w-5 h-5 ${blog.featured ? 'fill-current' : ''}`} />
                                                </button>
                                                <Link
                                                    to={`/admin/blogs/edit/${blog._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog._id, blog.title)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
