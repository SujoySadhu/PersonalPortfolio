import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiPlay, FiDownload, FiPaperclip } from 'react-icons/fi';
import { projectsAPI } from '../services/api';
import { processContentImages } from '../config/processContentImages';
import { getFileMeta, formatBytes, FileTypeIcon } from '../config/fileHelpers';

// Skeleton shown when loading from direct URL (not from project list)
const ProjectSkeleton = () => (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
            <div className="h-4 w-28 bg-gray-800 rounded mb-8" />
            <div className="h-2 w-12 bg-primary-500/40 rounded mb-4" />
            <div className="h-9 w-2/3 bg-gray-700 rounded mb-6" />
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

// Section heading with the left-border accent used throughout the details page
const SectionHeading = ({ icon: Icon, children }) => (
    <div className="border-l-[3px] border-primary-500 pl-4 mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {Icon && <Icon size={16} />} {children}
        </h3>
    </div>
);

// Cloudinary: force a download (Content-Disposition: attachment) via the fl_attachment flag
const toDownloadUrl = (url) => {
    if (!url || !url.includes('/upload/')) return url;
    return url.replace('/upload/', '/upload/fl_attachment/');
};

const ProjectDetails = () => {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

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
    const attachments = Array.isArray(project.attachments) ? project.attachments : [];
    // Show the overview if the description has text OR embedded media (images/video).
    // Quill stores images as <img> tags with no surrounding text, so a text-only
    // check would wrongly hide image-only descriptions.
    const hasOverview = !!project.description && (
        project.description.replace(/<[^>]+>/g, '').trim().length > 0 ||
        /<(img|iframe|video)\b/i.test(project.description)
    );

    const statusStyle = project.status === 'completed'
        ? 'bg-emerald-500/15 text-emerald-400'
        : project.status === 'in-progress'
            ? 'bg-amber-500/15 text-amber-400'
            : 'bg-gray-500/15 text-gray-400';

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

                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="section-ornament !mb-0" />
                    {project.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-400/80 capitalize">
                            {project.category.replace('-', ' / ')}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {project.title}
                </h1>

                {/* Lead / short description */}
                {project.shortDescription && (
                    <p className="text-lg text-gray-400 leading-relaxed mb-7 max-w-3xl">
                        {project.shortDescription}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-10">
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
                    {attachments.length > 0 && (
                        <a
                            href="#resources"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-lg text-sm font-medium transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <FiPaperclip size={15} /> {attachments.length} Resource{attachments.length > 1 ? 's' : ''}
                        </a>
                    )}
                    {project.status && (
                        <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium ${statusStyle}`}>
                            {project.status.replace('-', ' ').toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Overview */}
                {hasOverview && (
                    <div className="mb-12">
                        <div
                            className="prose-details text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: processContentImages(project.description) }}
                        />
                    </div>
                )}

                {/* Resources & Documents */}
                {attachments.length > 0 && (
                    <div className="mb-12 scroll-mt-24" id="resources">
                        <SectionHeading icon={FiPaperclip}>Resources &amp; Documents</SectionHeading>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {attachments.map((att, idx) => {
                                const meta = getFileMeta(att.format);
                                return (
                                    <div
                                        key={idx}
                                        className="group flex items-center gap-3.5 p-4 rounded-xl bg-dark-100 border border-gray-800/60 hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${meta.badge}`}>
                                            <FileTypeIcon format={att.format} size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate" title={att.name}>
                                                {att.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <span className={`uppercase font-medium ${meta.tint}`}>{meta.label}</span>
                                                {att.bytes > 0 && (<><span>·</span><span>{formatBytes(att.bytes)}</span></>)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                                title="View"
                                            >
                                                <FiExternalLink size={16} />
                                            </a>
                                            <a
                                                href={toDownloadUrl(att.url)}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                                title="Download"
                                            >
                                                <FiDownload size={16} />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

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
                    const groups = {};
                    project.techStack.forEach(tech => {
                        const rawName = typeof tech === 'string' ? tech : tech.name;
                        const cat = (typeof tech === 'object' && tech.category) ? tech.category : 'Tools';
                        if (!rawName) return;
                        // Split comma-joined names (e.g. "OpenGL,GLFW,GLAD") into separate chips
                        String(rawName).split(',').map(s => s.trim()).filter(Boolean).forEach(name => {
                            (groups[cat] = groups[cat] || []).push(name);
                        });
                    });
                    const categoryOrder = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools'];
                    const entries = categoryOrder
                        .filter(cat => groups[cat] && groups[cat].length > 0)
                        .map(cat => [cat, groups[cat]]);

                    return (
                        <div className="mb-12">
                            <SectionHeading>Technologies Used</SectionHeading>
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
                    <div className="mb-8 scroll-mt-24" id="demo-video">
                        <SectionHeading icon={FiPlay}>Demo Video</SectionHeading>
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
