import React, { useState, useEffect } from 'react';
import { FiSearch, FiTag, FiFilter } from 'react-icons/fi';
import { blogsAPI, categoriesAPI } from '../services/api';
import BlogCard from '../components/blog/BlogCard';
import Spinner from '../components/common/Spinner';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [featuredBlog, setFeaturedBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        tag: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getBySection('blog');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await blogsAPI.getTags();
            setTags(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: 9,
                published: 'true'
            };
            
            if (filters.search) params.search = filters.search;
            if (filters.category) params.category = filters.category;
            if (filters.tag) params.tag = filters.tag;

            const response = await blogsAPI.getAll(params);
            const allBlogs = response.data.data || [];
            
            // Set featured blog (first one with featured flag, or first blog)
            const featured = allBlogs.find(b => b.featured) || allBlogs[0];
            if (featured && pagination.page === 1 && !filters.search && !filters.category && !filters.tag) {
                setFeaturedBlog(featured);
                setBlogs(allBlogs.filter(b => b._id !== featured._id));
            } else {
                setFeaturedBlog(null);
                setBlogs(allBlogs);
            }
            
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination?.totalPages || 1,
                total: response.data.pagination?.total || 0
            }));
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleCategoryClick = (category) => {
        setFilters(prev => ({ 
            ...prev, 
            category: prev.category === category ? '' : category 
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleTagClick = (tag) => {
        setFilters(prev => ({ 
            ...prev, 
            tag: prev.tag === tag ? '' : tag 
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', tag: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-dark-100 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Blog
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Thoughts, tutorials, and insights about software development, 
                        technology, and my journey as a developer.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-dark-200 rounded-xl border border-gray-800 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <FiFilter className="text-gray-400" />
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filters.category === cat.name
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-dark-300 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {cat.emoji} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="flex flex-wrap gap-2 items-center">
                                <FiTag className="text-gray-400" />
                                {tags.slice(0, 10).map((tag, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            filters.tag === tag
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-dark-300 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Filters */}
                    {(filters.search || filters.category || filters.tag) && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">Active filters:</span>
                            {filters.search && (
                                <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-sm">
                                    Search: "{filters.search}"
                                </span>
                            )}
                            {filters.category && (
                                <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-sm">
                                    {filters.category}
                                </span>
                            )}
                            {filters.tag && (
                                <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-sm">
                                    #{filters.tag}
                                </span>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-400 hover:text-red-300"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : blogs.length === 0 && !featuredBlog ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No articles found
                        </h3>
                        <p className="text-gray-600">
                            {filters.search || filters.category || filters.tag
                                ? 'Try adjusting your filters'
                                : 'Check back soon for new content!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post */}
                        {featuredBlog && (
                            <div className="mb-8">
                                <BlogCard blog={featuredBlog} featured />
                            </div>
                        )}

                        {/* Blog Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <BlogCard key={blog._id} blog={blog} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Blog;
