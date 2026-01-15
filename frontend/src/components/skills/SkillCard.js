import React from 'react';
import { 
    FiCode, FiDatabase, FiServer, FiTool, 
    FiLayers, FiTerminal, FiGlobe, FiCpu 
} from 'react-icons/fi';

const SkillCard = ({ skill }) => {
    const { name, category, proficiency } = skill;

    const categoryIcons = {
        frontend: FiGlobe,
        backend: FiServer,
        database: FiDatabase,
        devops: FiTerminal,
        tools: FiTool,
        languages: FiCode,
        frameworks: FiLayers,
        other: FiCpu
    };

    const categoryColors = {
        frontend: 'from-blue-500 to-cyan-500',
        backend: 'from-green-500 to-emerald-500',
        database: 'from-purple-500 to-pink-500',
        devops: 'from-orange-500 to-yellow-500',
        tools: 'from-red-500 to-rose-500',
        languages: 'from-indigo-500 to-violet-500',
        frameworks: 'from-teal-500 to-cyan-500',
        other: 'from-gray-500 to-slate-500'
    };

    const Icon = categoryIcons[category] || FiCode;
    const gradientClass = categoryColors[category] || categoryColors.other;

    return (
        <div className="card p-4 hover:border-primary-500/50 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                    <Icon className="text-white" size={20} />
                </div>
                <div>
                    <h4 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                        {name}
                    </h4>
                    <span className="text-xs text-gray-500 capitalize">{category}</span>
                </div>
            </div>

            {/* Proficiency Bar */}
            <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Proficiency</span>
                    <span>{proficiency}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500`}
                        style={{ width: `${proficiency}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SkillCard;
