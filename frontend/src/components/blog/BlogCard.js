import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiEye, FiTag } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

const BlogCard = ({ blog, featured = false }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (featured) {
        return (
            <Link 
                to={`/blog/${blog.slug}`}
                className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
                <div className="md:flex">
                    <div className="md:w-1/2">
                        {blog.coverImage ? (
                            <img
                                src={getImageUrl(blog.coverImage)}
                                alt={blog.title}
                                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-64 md:h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-6xl text-white/30">📝</span>
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                                Featured
                            </span>
                            {blog.category && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    {blog.category}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                            {blog.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                            {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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
            </Link>
        );
    }

    return (
        <Link 
            to={`/blog/${blog.slug}`}
            className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-video overflow-hidden">
                {blog.coverImage ? (
                    <img
                        src={getImageUrl(blog.coverImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">📝</span>
                    </div>
                )}
            </div>
            <div className="p-5">
                {blog.category && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded mb-2">
                        {blog.category}
                    </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {blog.excerpt}
                </p>
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                            <span 
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                                <FiTag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
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
        </Link>
    );
};

export default BlogCard;
