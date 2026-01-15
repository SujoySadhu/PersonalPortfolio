import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiPlay, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { projectsAPI } from '../services/api';
import Loading from '../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
        if (!image) return 'https://via.placeholder.com/800x500?text=No+Image';
        return image.startsWith('http') ? image : `${API_URL}${image}`;
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
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <FiArrowLeft /> Back to Projects
                </Link>

                {/* Main Content */}
                <div className="card overflow-visible">
                    {/* Image Gallery */}
                    {project.images && project.images.length > 0 && (
                        <div className="relative">
                            <img
                                src={getImageUrl(project.images[selectedImage])}
                                alt={project.title}
                                className="w-full h-64 md:h-96 object-cover cursor-pointer"
                                onClick={() => setShowLightbox(true)}
                            />
                            
                            {/* Navigation Arrows */}
                            {project.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <FiChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <FiChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm">
                                {selectedImage + 1} / {project.images.length}
                            </div>
                        </div>
                    )}

                    {/* Thumbnail Strip */}
                    {project.images && project.images.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto bg-dark-300">
                            {project.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={getImageUrl(image)}
                                    alt={`${project.title} ${index + 1}`}
                                    className={`w-20 h-14 object-cover rounded cursor-pointer transition-all ${
                                        selectedImage === index
                                            ? 'ring-2 ring-primary-500'
                                            : 'opacity-60 hover:opacity-100'
                                    }`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {/* Title & Status */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {project.title}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        project.status === 'completed' 
                                            ? 'bg-green-500/20 text-green-400'
                                            : project.status === 'in-progress'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {project.status?.replace('-', ' ').toUpperCase()}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {project.githubLink && (
                                    <a
                                        href={project.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <FiGithub /> GitHub
                                    </a>
                                )}
                                {project.liveDemoLink && (
                                    <a
                                        href={project.liveDemoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <FiExternalLink /> Live Demo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Technologies Used
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                About This Project
                            </h3>
                            <div 
                                className="prose prose-invert max-w-none text-gray-300"
                                dangerouslySetInnerHTML={{ __html: project.description }}
                            />
                        </div>

                        {/* YouTube Video */}
                        {youtubeId && (
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FiPlay /> Project Demo Video
                                </h3>
                                <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-dark-300">
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

                {/* Lightbox */}
                {showLightbox && project.images && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                        
                        <button
                            onClick={prevImage}
                            className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiChevronLeft size={28} />
                        </button>
                        
                        <img
                            src={getImageUrl(project.images[selectedImage])}
                            alt={project.title}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        
                        <button
                            onClick={nextImage}
                            className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <FiChevronRight size={28} />
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
