import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiExternalLink, FiArrowRight } from 'react-icons/fi';
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
        category
    } = project;

    const imageUrl = getImageUrl(thumbnail);

    return (
        <div className="bg-dark-200 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden">
            {/* Logo/Image Section */}
            <div className="flex justify-center pt-8 pb-4">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-3xl font-bold">{title?.charAt(0)}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6 text-center">
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">
                    {shortDescription || description?.substring(0, 150)}
                </p>

                {/* Tech Stack Tags */}
                {techStack?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                        {techStack?.slice(0, 4).map((tech, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-dark-300 text-gray-300 rounded-full text-xs font-medium border border-gray-700"
                            >
                                {tech}
                            </span>
                        ))}
                        {techStack?.length > 4 && (
                            <span className="px-3 py-1 bg-dark-300 text-gray-500 rounded-full text-xs border border-gray-700">
                                +{techStack.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {(githubLink || liveDemoLink) && (
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {githubLink && (
                            <a
                                href={githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <FiGithub className="w-4 h-4" /> Repository
                            </a>
                        )}
                        {liveDemoLink && (
                            <a
                                href={liveDemoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiExternalLink className="w-4 h-4" /> Live Demo
                            </a>
                        )}
                    </div>
                )}

                {/* View Details Link */}
                <div className="pt-4 border-t border-gray-800">
                    <Link
                        to={`/projects/${_id}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group"
                    >
                        View Details <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
