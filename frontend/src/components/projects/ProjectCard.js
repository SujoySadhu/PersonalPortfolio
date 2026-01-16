import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiArrowRight, FiPlay } from 'react-icons/fi';

const ProjectCard = ({ project }) => {
    const {
        _id,
        title,
        shortDescription,
        description,
        techStack,
        githubLink,
        liveDemoLink
    } = project;

    // Categorize tech stack (basic categorization)
    const categorizeTech = (techs) => {
        if (!techs || techs.length === 0) return null;
        
        const frontendTechs = ['React', 'Next.js', 'NextJS', 'Vue', 'Angular', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'JavaScript', 'TypeScript', 'Redux', 'Svelte'];
        const backendTechs = ['Node.js', 'NodeJS', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Java', 'Python', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Golang', 'Rust', 'NestJS'];
        const databaseTechs = ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Prisma', 'Mongoose', 'SQL', 'DynamoDB', 'Cassandra'];

        const categorized = {
            frontend: [],
            backend: [],
            database: [],
            other: []
        };

        techs.forEach(tech => {
            const techLower = tech.toLowerCase();
            if (frontendTechs.some(f => techLower.includes(f.toLowerCase()))) {
                categorized.frontend.push(tech);
            } else if (backendTechs.some(b => techLower.includes(b.toLowerCase()))) {
                categorized.backend.push(tech);
            } else if (databaseTechs.some(d => techLower.includes(d.toLowerCase()))) {
                categorized.database.push(tech);
            } else {
                categorized.other.push(tech);
            }
        });

        return categorized;
    };

    const categorizedTech = categorizeTech(techStack);

    // Split title for gradient effect on last word
    const titleWords = title?.split(' ') || [];
    const lastWord = titleWords.pop();
    const firstWords = titleWords.join(' ');

    return (
        <div className="bg-dark-200/50 rounded-xl border border-gray-800/50 p-4 sm:p-5 hover:border-gray-700 transition-all duration-300">
            {/* Title with gradient on last word */}
            <h3 className="text-lg font-bold text-white mb-2">
                {firstWords && <span className="text-gray-300">{firstWords} </span>}
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{lastWord}</span>
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {shortDescription || description?.substring(0, 120)}
            </p>

            {/* Action Buttons - Compact */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Link
                    to={`/projects/${_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-full hover:bg-gray-700 transition-colors"
                >
                    Read more <FiArrowRight className="w-3 h-3" />
                </Link>
                
                {githubLink && (
                    <a
                        href={githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <FiGithub className="w-3 h-3" /> Code
                    </a>
                )}
                
                {liveDemoLink && (
                    <a
                        href={liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <FiPlay className="w-3 h-3" /> Demo
                    </a>
                )}
            </div>

            {/* Tech Stack Section - Compact */}
            {techStack && techStack.length > 0 && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Tech Stack</h4>
                    
                    <div className="space-y-2">
                        {/* Frontend */}
                        {categorizedTech?.frontend?.length > 0 && (
                            <div className="bg-dark-300/50 rounded-lg p-2.5 border border-gray-800/50">
                                <span className="text-xs font-medium text-white mb-1.5 block">Frontend</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {categorizedTech.frontend.map((tech, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-dark-200 text-gray-300 rounded-full text-xs">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Backend */}
                        {categorizedTech?.backend?.length > 0 && (
                            <div className="bg-dark-300/50 rounded-lg p-2.5 border border-gray-800/50">
                                <span className="text-xs font-medium text-white mb-1.5 block">Backend</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {categorizedTech.backend.map((tech, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-dark-200 text-gray-300 rounded-full text-xs">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Database */}
                        {categorizedTech?.database?.length > 0 && (
                            <div className="bg-dark-300/50 rounded-lg p-2.5 border border-gray-800/50">
                                <span className="text-xs font-medium text-white mb-1.5 block">Database</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {categorizedTech.database.map((tech, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-dark-200 text-gray-300 rounded-full text-xs">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other/Tools */}
                        {categorizedTech?.other?.length > 0 && (
                            <div className="bg-dark-300/50 rounded-lg p-2.5 border border-gray-800/50">
                                <span className="text-xs font-medium text-white mb-1.5 block">Tools</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {categorizedTech.other.map((tech, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-dark-200 text-gray-300 rounded-full text-xs">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;
