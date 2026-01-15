import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiEye, FiTag, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { blogsAPI } from '../services/api';
import Spinner from '../components/common/Spinner';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedBlogs, setRelatedBlogs] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchBlog();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await blogsAPI.getOne(slug);
            setBlog(response.data.data);
            
            // Fetch related blogs by category
            if (response.data.data?.category) {
                fetchRelatedBlogs(response.data.data.category, response.data.data._id);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            if (error.response?.status === 404) {
                navigate('/blog');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async (category, excludeId) => {
        try {
            const response = await blogsAPI.getAll({ 
                category, 
                limit: 3, 
                published: 'true' 
            });
            const filtered = (response.data.data || []).filter(b => b._id !== excludeId);
            setRelatedBlogs(filtered.slice(0, 3));
        } catch (error) {
            console.error('Error fetching related blogs:', error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || '';

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
                    <Link to="/blog" className="text-primary-600 hover:text-primary-700">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            {/* Hero Section */}
            <div className="relative">
                {blog.coverImage ? (
                    <div className="h-96 md:h-[500px] relative">
                        <img
                            src={`${API_URL}${blog.coverImage}`}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </div>
                ) : (
                    <div className="h-64 md:h-80 bg-gradient-to-br from-primary-600 to-primary-800" />
                )}
                
                <div className="container mx-auto px-4 relative -mt-32 md:-mt-40">
                    <div className="max-w-4xl mx-auto">
                        <Link 
                            to="/blog"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                        >
                            <FiArrowLeft />
                            Back to Blog
                        </Link>
                        
                        {blog.category && (
                            <span className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full mb-4">
                                {blog.category}
                            </span>
                        )}
                        
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {blog.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-white/80">
                            {blog.author && (
                                <span className="font-medium text-white">
                                    By {blog.author}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                {formatDate(blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {blog.readTime} min read
                            </span>
                            <span className="flex items-center gap-1">
                                <FiEye className="w-4 h-4" />
                                {blog.views} views
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
                                {blog.tags.map((tag, index) => (
                                    <Link
                                        key={index}
                                        to={`/blog?tag=${tag}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors"
                                    >
                                        <FiTag className="w-3 h-3" />
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Blog Content */}
                        <div 
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Share Section */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiShare2 className="w-5 h-5" />
                                    <span className="font-medium">Share this article</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={shareLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        aria-label="Share on Facebook"
                                    >
                                        <FaFacebook className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={shareLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                                        aria-label="Share on Twitter"
                                    >
                                        <FaTwitter className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={shareLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                                        aria-label="Share on LinkedIn"
                                    >
                                        <FaLinkedin className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedBlogs.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedBlogs.map((relatedBlog) => (
                                    <Link
                                        key={relatedBlog._id}
                                        to={`/blog/${relatedBlog.slug}`}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            {relatedBlog.coverImage ? (
                                                <img
                                                    src={`${API_URL}${relatedBlog.coverImage}`}
                                                    alt={relatedBlog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                    <span className="text-3xl text-gray-400">📝</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {relatedBlog.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {formatDate(relatedBlog.createdAt)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
