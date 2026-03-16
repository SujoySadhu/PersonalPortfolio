import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiPlay, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { projectsAPI, getImageUrl as getImg } from '../services/api';
import { processContentImages } from '../config/processContentImages';

// Skeleton shown when loading from direct URL (not from project list)
const ProjectSkeleton = () => (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
            <div className="h-4 w-28 bg-gray-800 rounded mb-8" />
            <div className="h-2 w-12 bg-primary-500/40 rounded mb-4" />
            <div className="h-9 w-2/3 bg-gray-700 rounded mb-6" />
            <div className="aspect-video w-full bg-gray-800 rounded-2xl mb-8" />
            <div className="flex gap-3 mb-8">
                <div className="h-9 w-24 bg-gray-800 rounded-lg" />
                <div className="h-9 w-24 bg-gray-800 rounded-lg" />
            </div>
            <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: `${90 - i * 8}%` }} />)}
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-7 w-20 bg-gray-800 rounded-lg" />)}
            </div>
        </div>
    </div>
);

const ProjectDetails = () => {
    const { id } = useParams();
    const location = useLocation();

    // Use project passed via router state for instant render (from project list)
    // but ALWAYS fetch full data because the list API excludes 'description'
    const [project, setProject] = useState(location.state?.project || null);
    const [loading, setLoading] = useState(!location.state?.project);

    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const fetchProject = React.useCallback(async () => {
        try {
            const response = await projectsAPI.getOne(id);
            setProject(response.data.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // Always fetch from API to get the full project (list API excludes description)
        fetchProject();
    }, [fetchProject]);

    const getImageUrl = (image) => {
        return getImg(image) || 'https://via.placeholder.com/800x500?text=No+Image';
    };

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
        return match ? match[1] : null;
    };



    if (loading) {
        return <ProjectSkeleton />;
    }

    if (!project) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
                <h2 className="text-2xl text-white mb-4">Project not found</h2>
                <Link to="/projects" className="btn-primary">Back to Projects</Link>
            </div>
        );
    }

    const youtubeId = extractYouTubeId(project.youtubeLink);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm"
                >
                    <FiArrowLeft size={14} /> Back to Projects
                </Link>

                {/* Project Title */}
                <div className="section-ornament" />
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {project.title}
                </h1>

                {/* Image Gallery removed as per request */}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {project.githubLink && (
                        <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <FiGithub size={15} /> GitHub
                        </a>
                    )}
                    {project.liveDemoLink && (
                        <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg text-sm font-medium"
                        >
                            <FiExternalLink size={15} /> Live Demo
                        </a>
                    )}
                    {youtubeId && (
                        <a
                            href="#demo-video"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-lg text-sm font-medium transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <FiPlay size={15} /> Demo Video
                        </a>
                    )}
                    {project.status && (
                        <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium ${project.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : project.status === 'in-progress'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-gray-500/15 text-gray-400'
                            }`}>
                            {project.status?.replace('-', ' ').toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Description - Markdown style with left border accents */}
                <div className="space-y-6 mb-8">
                    <div
                        className="prose-details text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: processContentImages(project.description) }}
                    />
                </div>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (() => {
                    const groupDot = {
                        Frontend: 'bg-blue-400',
                        Backend: 'bg-emerald-400',
                        Database: 'bg-violet-400',
                        DevOps: 'bg-amber-400',
                        Tools: 'bg-gray-400',
                    };
                    const groupLabel = {
                        Frontend: 'text-blue-400/70',
                        Backend: 'text-emerald-400/70',
                        Database: 'text-violet-400/70',
                        DevOps: 'text-amber-400/70',
                        Tools: 'text-gray-500',
                    };
                    // Group tech by category
                    const groups = {};
                    project.techStack.forEach(tech => {
                        const name = typeof tech === 'string' ? tech : tech.name;
                        const cat = (typeof tech === 'object' && tech.category) ? tech.category : 'Tools';
                        if (!name) return;
                        (groups[cat] = groups[cat] || []).push(name);
                    });
                    const categoryOrder = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools'];
                    const entries = categoryOrder
                        .filter(cat => groups[cat] && groups[cat].length > 0)
                        .map(cat => [cat, groups[cat]]);

                    return (
                        <div className="mb-8">
                            <div className="border-l-[3px] border-primary-500 pl-4 mb-4">
                                <h3 className="text-lg font-bold text-white">Technologies Used</h3>
                            </div>
                            <div className="space-y-3">
                                {entries.map(([group, techs]) => (
                                    <div key={group} className="flex items-start gap-3">
                                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${groupDot[group] || 'bg-gray-400'}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${groupLabel[group] || 'text-gray-500'} w-20`}>
                                                {group}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {techs.map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-dark-100 border border-gray-800/60 text-gray-300 rounded-lg text-sm"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* YouTube Video */}
                {youtubeId && (
                    <div className="mb-8" id="demo-video">
                        <div className="border-l-[3px] border-primary-500 pl-4 mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FiPlay size={16} /> Demo Video
                            </h3>
                        </div>
                        <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-dark-100 border border-gray-800/60">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="Project Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
