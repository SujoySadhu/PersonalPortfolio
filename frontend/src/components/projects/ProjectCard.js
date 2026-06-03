import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FiGithub, FiArrowRight, FiExternalLink, FiPaperclip,
    FiGlobe, FiSmartphone, FiMonitor, FiCpu, FiFolder, FiStar
} from 'react-icons/fi';
import { groupTechStack, getTechCategory } from '../../config/techCategories';

const categoryMeta = {
    web: { label: 'Web', Icon: FiGlobe, cls: 'text-sky-400' },
    mobile: { label: 'Mobile', Icon: FiSmartphone, cls: 'text-emerald-400' },
    desktop: { label: 'Desktop', Icon: FiMonitor, cls: 'text-violet-400' },
    'ai-ml': { label: 'AI / ML', Icon: FiCpu, cls: 'text-pink-400' },
    other: { label: 'Project', Icon: FiFolder, cls: 'text-gray-400' },
};

const MAX_CHIPS = 8;

const ProjectCard = ({ project }) => {
    const {
        _id, title, shortDescription, description,
        techStack, githubLink, liveDemoLink, status, category, featured, attachments
    } = project;

    const attachmentCount = Array.isArray(attachments) ? attachments.length : 0;
    const cat = categoryMeta[category] || categoryMeta.other;
    const CatIcon = cat.Icon;

    // Group tech by resolved category (splits comma-joined names, auto-detects
    // Graphics/Hardware/etc.), then cap the number of chips to keep cards tidy.
    const { groups, hidden } = useMemo(() => {
        const all = groupTechStack(techStack);
        let budget = MAX_CHIPS;
        const capped = [];
        for (const [g, list] of all) {
            if (budget <= 0) break;
            const vis = list.slice(0, budget);
            budget -= vis.length;
            capped.push([g, vis]);
        }
        const total = all.reduce((s, [, l]) => s + l.length, 0);
        const shown = capped.reduce((s, [, l]) => s + l.length, 0);
        return { groups: capped, hidden: total - shown };
    }, [techStack]);

    const plainDesc = shortDescription || description?.replace(/<[^>]+>/g, '').trim();

    return (
        <div className="group relative bg-dark-100 border border-gray-800/60 rounded-2xl h-full flex flex-col transition-all duration-300 hover:border-gray-600/80 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.6)]">
            {/* Top accent line — animates from center on hover */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 rounded-t-2xl transition-transform duration-500 origin-center scale-x-0 group-hover:scale-x-100" />

            <div className="p-6 flex flex-col flex-1">
                {/* Eyebrow: category + status */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${cat.cls}`}>
                        <CatIcon size={13} /> {cat.label}
                    </span>
                    <div className="flex items-center gap-2">
                        {featured && (
                            <FiStar size={13} className="text-amber-400 fill-amber-400" title="Featured" />
                        )}
                        {status && (
                            <span className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : status === 'in-progress'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-gray-500/10 text-gray-400'
                                }`}>
                                {status.replace('-', ' ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors duration-200 mb-2.5">
                    {title}
                </h3>

                {/* Description */}
                {plainDesc && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">
                        {plainDesc}
                    </p>
                )}

                {/* Tech stack — grouped, comma-split, capped */}
                {groups.length > 0 && (
                    <div className="mb-5 space-y-2.5">
                        {groups.map(([group, techs]) => {
                            const meta = getTechCategory(group);
                            return (
                                <div key={group} className="flex items-start gap-2">
                                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${meta.text}`}>
                                            {meta.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {techs.map((tech, i) => (
                                            <span key={i} className="text-[11px] text-gray-300 bg-dark-200/80 border border-gray-700/40 px-2 py-0.5 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {hidden > 0 && (
                            <span className="text-[11px] text-gray-500">+{hidden} more</span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-4 border-t border-gray-800/40">
                    <Link
                        to={`/projects/${_id}`}
                        state={{ project }}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-dark-200 text-sm font-semibold rounded-full hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 transition-all duration-200 active:scale-95"
                    >
                        View Details <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    {githubLink && (
                        <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-700 text-gray-300 text-sm font-medium rounded-full hover:border-gray-500 hover:text-white hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FiGithub size={14} /> Code
                        </a>
                    )}
                    {liveDemoLink && (
                        <a
                            href={liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-700 text-gray-300 text-sm font-medium rounded-full hover:border-gray-500 hover:text-white hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FiExternalLink size={14} /> Demo
                        </a>
                    )}
                    {attachmentCount > 0 && (
                        <span
                            className="inline-flex items-center gap-1.5 ml-auto text-xs text-gray-500"
                            title={`${attachmentCount} downloadable resource${attachmentCount > 1 ? 's' : ''}`}
                        >
                            <FiPaperclip size={13} /> {attachmentCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProjectCard);
