import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiPlay, FiChevronLeft, FiChevronRight, FiX, FiImage } from 'react-icons/fi';
import { projectsAPI, getImageUrl as getImg } from '../services/api';
import { processContentImages } from '../config/processContentImages';

// Placeholder for broken images
const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" fill="%231a1a2e"><rect width="800" height="500"/><text x="400" y="260" text-anchor="middle" fill="%23555" font-size="20">Image not available</text></svg>'
);

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

// Robust image component with loading state and error fallback
const SafeImage = ({ src, alt, className, onClick, eager, ...props }) => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
    const imgRef = useRef(null);

    useEffect(() => {
        setStatus('loading');
    }, [src]);

    return (
        <div className="relative w-full h-full">
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-200 animate-pulse rounded-inherit">
                    <FiImage className="text-gray-600" size={32} />
                </div>
            )}
            {status === 'error' ? (
                <div className={`flex items-center justify-center bg-dark-200 ${className}`} onClick={onClick}>
                    <div className="text-center p-4">
                        <FiImage className="text-gray-600 mx-auto mb-2" size={32} />
                        <p className="text-gray-500 text-xs">Image not available</p>
                    </div>
                </div>
            ) : (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={`${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onClick={onClick}
                    loading={eager ? 'eager' : 'lazy'}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                    {...props}
                />
            )}
        </div>
    );
};

const ProjectDetails = () => {
    const { id } = useParams();
    const location = useLocation();

    // Use project passed via router state for instant render (from project list)
    const [project, setProject] = useState(location.state?.project || null);
    const [loading, setLoading] = useState(!location.state?.project);

    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    // Touch/swipe support for mobile carousel
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const minSwipeDistance = 50;

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
        // Only fetch from API if we don't already have data (direct URL / page refresh)
        if (!location.state?.project) {
            fetchProject();
        }
    }, [fetchProject, location.state?.project]);

    const getImageUrl = useCallback((image) => {
        if (!image) return PLACEHOLDER_IMG;
        const url = getImg(image);
        return url || PLACEHOLDER_IMG;
    }, []);

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
        return match ? match[1] : null;
    };

    const nextImage = useCallback(() => {
        if (project?.images?.length > 0) {
            setSelectedImage((prev) => (prev + 1) % project.images.length);
        }
    }, [project?.images?.length]);

    const prevImage = useCallback(() => {
        if (project?.images?.length > 0) {
            setSelectedImage((prev) => (prev - 1 + project.images.length) % project.images.length);
        }
    }, [project?.images?.length]);

    // Touch handlers for swipe
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = null;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) >= minSwipeDistance) {
            if (distance > 0) {
                nextImage(); // swipe left → next
            } else {
                prevImage(); // swipe right → prev
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    }, [nextImage, prevImage]);

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
                                        <SafeImage
                                            src={getImageUrl(image)}
                                            alt={`${project.title} ${index + 1}`}
                                            className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                                            eager={index === 0}
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
                                <div
                                    className="relative rounded-2xl overflow-hidden bg-dark-100 border border-gray-800/60 touch-pan-y"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <SafeImage
                                        src={getImageUrl(project.images[selectedImage])}
                                        alt={project.title}
                                        className="w-full aspect-video object-contain bg-dark-200 cursor-pointer"
                                        onClick={() => setShowLightbox(true)}
                                        eager
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
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                                        {project.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`w-16 h-11 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImage === index
                                                    ? 'ring-2 ring-primary-500 opacity-100'
                                                    : 'opacity-50 hover:opacity-80'
                                                    }`}
                                                onClick={() => setSelectedImage(index)}
                                            >
                                                <SafeImage
                                                    src={getImageUrl(image)}
                                                    alt={`${project.title} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
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
                    <div
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                        >
                            <FiX size={20} />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                        >
                            <FiChevronLeft size={24} />
                        </button>

                        <SafeImage
                            src={getImageUrl(project.images[selectedImage])}
                            alt={project.title}
                            className="max-w-full max-h-[90vh] object-contain"
                            eager
                        />

                        <button
                            onClick={nextImage}
                            className="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
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
