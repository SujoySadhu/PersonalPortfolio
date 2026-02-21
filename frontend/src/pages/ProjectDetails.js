import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiPlay, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { projectsAPI, getImageUrl as getImg } from '../services/api';
import { processContentImages } from '../config/processContentImages';
import Loading from '../components/common/Loading';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const nextImage = () => {
        if (project?.images?.length > 0) {
            setSelectedImage((prev) => (prev + 1) % project.images.length);
        }
    };

    const prevImage = () => {
        if (project?.images?.length > 0) {
            setSelectedImage((prev) => (prev - 1 + project.images.length) % project.images.length);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading project..." />
            </div>
        );
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

                {/* Image Gallery */}
                {project.images && project.images.length > 0 && (
                    <div className="mb-8">
                        {/* Grid Layout */}
                        {project.imageLayout === 'grid' ? (
                            <div className={`grid gap-3 ${project.images.length === 1 ? 'grid-cols-1' :
                                    project.images.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-2 md:grid-cols-3'
                                }`}>
                                {project.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-xl overflow-hidden bg-dark-100 border border-gray-800/60 cursor-pointer group"
                                        onClick={() => { setSelectedImage(index); setShowLightbox(true); }}
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${project.title} ${index + 1}`}
                                            className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Carousel Layout (default) */
                            <>
                                <div className="relative rounded-2xl overflow-hidden bg-dark-100 border border-gray-800/60">
                                    <img
                                        src={getImageUrl(project.images[selectedImage])}
                                        alt={project.title}
                                        className="w-full aspect-video object-contain bg-dark-200 cursor-pointer"
                                        onClick={() => setShowLightbox(true)}
                                        loading="lazy"
                                    />

                                    {project.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <FiChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <FiChevronRight size={20} />
                                            </button>
                                        </>
                                    )}

                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs">
                                        {selectedImage + 1} / {project.images.length}
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                {project.images.length > 1 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                        {project.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={getImageUrl(image)}
                                                alt={`${project.title} ${index + 1}`}
                                                className={`w-16 h-11 object-cover rounded-lg cursor-pointer transition-all flex-shrink-0 ${selectedImage === index
                                                    ? 'ring-2 ring-primary-500 opacity-100'
                                                    : 'opacity-50 hover:opacity-80'
                                                    }`}
                                                onClick={() => setSelectedImage(index)}
                                                loading="lazy"
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

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
                {project.techStack && project.techStack.length > 0 && (
                    <div className="mb-8">
                        <div className="border-l-[3px] border-primary-500 pl-4 mb-4">
                            <h3 className="text-lg font-bold text-white">Technologies Used</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-dark-100 border border-gray-800/60 text-gray-300 rounded-lg text-sm"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

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

                {/* Lightbox */}
                {showLightbox && project.images && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiX size={20} />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiChevronLeft size={24} />
                        </button>

                        <img
                            src={getImageUrl(project.images[selectedImage])}
                            alt={project.title}
                            className="max-w-full max-h-[90vh] object-contain"
                        />

                        <button
                            onClick={nextImage}
                            className="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiChevronRight size={24} />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                            {selectedImage + 1} / {project.images.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
