import React from 'react';
import {
    FiCode, FiDatabase, FiServer, FiTool,
    FiLayers, FiTerminal, FiGlobe, FiCpu
} from 'react-icons/fi';

const categoryConfig = {
    frontend: { icon: FiGlobe, color: 'text-blue-400', bar: 'bg-blue-500', bg: 'bg-blue-500/10' },
    backend: { icon: FiServer, color: 'text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
    database: { icon: FiDatabase, color: 'text-violet-400', bar: 'bg-violet-500', bg: 'bg-violet-500/10' },
    devops: { icon: FiTerminal, color: 'text-orange-400', bar: 'bg-orange-500', bg: 'bg-orange-500/10' },
    tools: { icon: FiTool, color: 'text-cyan-400', bar: 'bg-cyan-500', bg: 'bg-cyan-500/10' },
    languages: { icon: FiCode, color: 'text-indigo-400', bar: 'bg-indigo-500', bg: 'bg-indigo-500/10' },
    frameworks: { icon: FiLayers, color: 'text-teal-400', bar: 'bg-teal-500', bg: 'bg-teal-500/10' },
    'ai-ml': { icon: FiCpu, color: 'text-pink-400', bar: 'bg-pink-500', bg: 'bg-pink-500/10' },
    other: { icon: FiCpu, color: 'text-gray-400', bar: 'bg-gray-500', bg: 'bg-gray-500/10' },
};

const SkillCard = ({ skill }) => {
    const { name, category, proficiency, icon: skillIcon } = skill;
    const config = categoryConfig[category] || categoryConfig.other;
    const Icon = config.icon;

    return (
        <div className="group flex items-center gap-3.5 py-3 px-1 transition-colors duration-200">
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center ${config.color}`}>
                {skillIcon ? (
                    <span className="text-sm">{skillIcon}</span>
                ) : (
                    <Icon size={16} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm text-white font-medium block truncate mb-1.5">{name}</span>
                <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${config.bar} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${proficiency}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(SkillCard);
