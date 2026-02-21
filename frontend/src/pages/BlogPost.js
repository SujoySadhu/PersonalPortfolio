import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiEye, FiTag, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { blogsAPI, getImageUrl } from '../services/api';
import { processContentImages } from '../config/processContentImages';
import Spinner from '../components/common/Spinner';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedBlogs, setRelatedBlogs] = useState([]);

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
                    <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
                    <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-6 lg:px-12">
                {/* Back link */}
                <Link 
                    to="/blog"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm"
                >
                    <FiArrowLeft size={14} />
                    Back to Blog
                </Link>

                {/* Header */}
                <div className="mb-8">
                    {blog.category && (
                        <span className="inline-block px-2 py-1 bg-gray-800/60 text-gray-400 text-xs rounded mb-4">
                            {blog.category}
                        </span>
                    )}
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        {blog.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                        {blog.author && (
                            <span className="text-gray-400">
                                {blog.author}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <FiCalendar className="w-3.5 h-3.5" />
                            {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5" />
                            {blog.readTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                            <FiEye className="w-3.5 h-3.5" />
                            {blog.views} views
                        </span>
                    </div>
                </div>

                {/* Cover Image */}
                {blog.coverImage && (
                    <div className="rounded-2xl overflow-hidden mb-8">
                        <img
                            src={getImageUrl(blog.coverImage)}
                            alt={blog.title}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-800/60">
                        {blog.tags.map((tag, index) => (
                            <Link
                                key={index}
                                to={`/blog?tag=${tag}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-400 rounded text-xs hover:text-white transition-colors"
                            >
                                <FiTag className="w-3 h-3" />
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Blog Content */}
                <div 
                    className="prose-details"
                    dangerouslySetInnerHTML={{ __html: processContentImages(blog.content) }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-800/60">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiShare2 className="w-4 h-4" />
                            <span>Share this article</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={shareLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-gray-800/60 text-gray-500 rounded-lg flex items-center justify-center hover:text-white transition-colors"
                                aria-label="Share on Facebook"
                            >
                                <FaFacebook className="w-4 h-4" />
                            </a>
                            <a
                                href={shareLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-gray-800/60 text-gray-500 rounded-lg flex items-center justify-center hover:text-white transition-colors"
                                aria-label="Share on Twitter"
                            >
                                <FaTwitter className="w-4 h-4" />
                            </a>
                            <a
                                href={shareLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-gray-800/60 text-gray-500 rounded-lg flex items-center justify-center hover:text-white transition-colors"
                                aria-label="Share on LinkedIn"
                            >
                                <FaLinkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-800/60">
                        <h2 className="text-lg font-semibold text-white mb-6">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog._id}
                                    to={`/blog/${relatedBlog.slug}`}
                                    className="bg-dark-100 rounded-xl overflow-hidden border border-gray-800/60 hover:border-gray-700 transition-colors group"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        {relatedBlog.coverImage ? (
                                            <img
                                                src={getImageUrl(relatedBlog.coverImage)}
                                                alt={relatedBlog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-dark-200 flex items-center justify-center">
                                                <span className="text-2xl text-gray-700">📝</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-white text-sm group-hover:text-gray-300 transition-colors line-clamp-2">
                                            {relatedBlog.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-2">
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
    );
};

export default BlogPost;
