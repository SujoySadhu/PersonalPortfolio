import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar } from 'react-icons/fi';
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
                className="group block bg-dark-100 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300"
            >
                <div className="md:flex">
                    <div className="md:w-1/2">
                        {blog.coverImage ? (
                            <img
                                src={getImageUrl(blog.coverImage)}
                                alt={blog.title}
                                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-64 md:h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-5xl text-gray-700">&#9998;</span>
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-md">
                                Featured
                            </span>
                            {blog.category && (
                                <span className="px-2.5 py-1 bg-gray-800/60 text-gray-400 text-xs rounded-md">
                                    {blog.category}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors leading-snug">
                            {blog.title}
                        </h2>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5">
                                <FiCalendar className="w-3.5 h-3.5" />
                                {formatDate(blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FiClock className="w-3.5 h-3.5" />
                                {blog.readTime} min read
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
            className="group block bg-dark-100 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300"
        >
            <div className="aspect-video overflow-hidden">
                {blog.coverImage ? (
                    <img
                        src={getImageUrl(blog.coverImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-4xl text-gray-700">&#9998;</span>
                    </div>
                )}
            </div>
            <div className="p-5">
                {blog.category && (
                    <span className="inline-block px-2.5 py-1 bg-gray-800/60 text-gray-400 text-xs font-medium rounded-md mb-2">
                        {blog.category}
                    </span>
                )}
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(blog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <FiClock className="w-3 h-3" />
                        {blog.readTime} min
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
