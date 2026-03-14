import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiArrowRight, FiExternalLink } from 'react-icons/fi';

const techMatch = (t, terms) => terms.some(term =>
    term.length <= 2 ? t === term : (term.length === 3 ? (t === term || t.startsWith(term)) : t.includes(term))
);

const categorizeTech = (tech) => {
    const t = tech.toLowerCase().trim();
    if (techMatch(t, ['react', 'vue', 'vue.js', 'angular', 'svelte', 'next', 'nuxt', 'html', 'tailwind', 'bootstrap', 'typescript', 'javascript', 'jquery', 'redux', 'zustand', 'vite', 'webpack', 'gatsby', 'remix', 'sass', 'scss', 'css', 'material', 'chakra', 'framer', 'styled'])) return 'Frontend';
    if (techMatch(t, ['node', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'nestjs', 'nest.js', 'graphql', 'socket.io', 'python', 'java', 'golang', 'rust', 'kotlin', 'scala', '.net', 'php', 'c++', 'c#', 'go', 'ruby', 'elixir', 'hapi', 'koa', 'strapi'])) return 'Backend';
    if (techMatch(t, ['mongo', 'postgres', 'mysql', 'sqlite', 'redis', 'firebase', 'supabase', 'prisma', 'sequelize', 'dynamo', 'elastic', 'cassandra', 'neo4j', 'mariadb', 'mongoose'])) return 'Database';
    if (techMatch(t, ['docker', 'kubernetes', 'heroku', 'vercel', 'netlify', 'nginx', 'jenkins', 'terraform', 'linux', 'render', 'cloudflare', 'postman', 'figma', 'jira', 'github', 'gitlab', 'aws', 'gcp', 'azure', 'railway', 'ci/cd'])) return 'DevOps';
    return 'Tools';
};

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

const ProjectCard = ({ project }) => {
    const {
        _id, title, shortDescription, description,
        techStack, githubLink, liveDemoLink, status
    } = project;

    const groupedTech = useMemo(() => {
        if (!techStack || techStack.length === 0) return null;
        const groups = {};
        techStack.forEach(tech => {
            // Support both new {name, category} objects and legacy strings
            const name = typeof tech === 'string' ? tech : tech.name;
            const cat = (typeof tech === 'object' && tech.category) ? tech.category : categorizeTech(name || '');
            if (!name) return;
            (groups[cat] = groups[cat] || []).push(name);
        });
        return Object.entries(groups);
    }, [techStack]);

    return (
        <div className="group relative bg-dark-100 border border-gray-800/60 rounded-2xl h-full flex flex-col transition-all duration-300 hover:border-gray-600/80 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            {/* Top accent line - animates from center on hover */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 rounded-t-2xl transition-all duration-500 origin-center scale-x-0 group-hover:scale-x-100" />
            {/* Bottom glow on hover */}
            <div className="absolute -bottom-1 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6 flex flex-col flex-1">
                {/* Header: Title + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-300 transition-colors duration-200">
                        {title}
                    </h3>
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

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">
                    {shortDescription || description?.replace(/<[^>]+>/g, '').substring(0, 150)}
                </p>

                {/* Tech Stack - compact grouped */}
                {groupedTech && groupedTech.length > 0 && (
                    <div className="mb-5 space-y-2.5">
                        {groupedTech.map(([group, techs]) => (
                            <div key={group} className="flex items-start gap-2">
                                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${groupDot[group]}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${groupLabel[group]} w-16`}>
                                        {group}
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
                        ))}
                    </div>
                )}

                {/* Action Buttons - pushed to bottom */}
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
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProjectCard);
