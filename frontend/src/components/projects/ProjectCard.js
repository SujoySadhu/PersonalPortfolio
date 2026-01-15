import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiExternalLink, FiPlay, FiStar, FiYoutube } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

const ProjectCard = ({ project }) => {
    const {
        _id,
        title,
        shortDescription,
        description,
        thumbnail,
        techStack,
        githubLink,
        liveDemoLink,
        youtubeLink,
        featured
    } = project;

    const imageUrl = getImageUrl(thumbnail) || 'https://via.placeholder.com/400x250?text=No+Image';

    return (
        <div className="card group hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative overflow-hidden h-48">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Featured Badge */}
                {featured && (
                    <div className="absolute top-3 left-3 bg-yellow-500/90 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FiStar size={12} /> Featured
                    </div>
                )}
                {/* YouTube Badge */}
                {youtubeLink && (
                    <div className="absolute top-3 right-3 bg-red-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FiYoutube size={12} /> Video
                    </div>
                )}
                {/* Overlay with Links */}
                <div className="absolute inset-0 bg-dark-300/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {githubLink && (
                        <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="View Source Code"
                        >
                            <FiGithub size={20} />
                        </a>
                    )}
                    {liveDemoLink && (
                        <a
                            href={liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Live Demo"
                        >
                            <FiExternalLink size={20} />
                        </a>
                    )}
                    {youtubeLink && (
                        <a
                            href={youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Watch Demo Video"
                        >
                            <FiPlay size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <Link to={`/projects/${_id}`}>
                    <h3 className="text-xl font-semibold text-white mb-2 hover:text-primary-400 transition-colors">
                        {title}
                    </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {shortDescription || description?.substring(0, 120)}...
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {techStack?.slice(0, 4).map((tech, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-xs font-medium"
                        >
                            {tech}
                        </span>
                    ))}
                    {techStack?.length > 4 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                            +{techStack.length - 4}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-700/50">
                    <Link
                        to={`/projects/${_id}`}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                        View Details →
                    </Link>
                    
                    {youtubeLink && (
                        <a
                            href={youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FiPlay size={14} /> Watch Demo
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
