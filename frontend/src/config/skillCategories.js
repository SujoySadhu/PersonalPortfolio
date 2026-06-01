/**
 * Shared skill presentation config — used by SkillCard, the Skills page,
 * and the Home skills section so category styling and proficiency levels
 * stay consistent everywhere.
 */
import {
    FiCode, FiDatabase, FiServer, FiTool,
    FiLayers, FiTerminal, FiGlobe, FiCpu
} from 'react-icons/fi';

export const SKILL_CATEGORIES = {
    frontend: { label: 'Frontend', Icon: FiGlobe, text: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'from-blue-500 to-blue-400' },
    backend: { label: 'Backend', Icon: FiServer, text: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'from-emerald-500 to-emerald-400' },
    database: { label: 'Database', Icon: FiDatabase, text: 'text-violet-400', bg: 'bg-violet-500/10', bar: 'from-violet-500 to-violet-400' },
    devops: { label: 'DevOps', Icon: FiTerminal, text: 'text-orange-400', bg: 'bg-orange-500/10', bar: 'from-orange-500 to-orange-400' },
    tools: { label: 'Tools', Icon: FiTool, text: 'text-cyan-400', bg: 'bg-cyan-500/10', bar: 'from-cyan-500 to-cyan-400' },
    languages: { label: 'Languages', Icon: FiCode, text: 'text-indigo-400', bg: 'bg-indigo-500/10', bar: 'from-indigo-500 to-indigo-400' },
    frameworks: { label: 'Frameworks', Icon: FiLayers, text: 'text-teal-400', bg: 'bg-teal-500/10', bar: 'from-teal-500 to-teal-400' },
    'ai-ml': { label: 'AI / ML', Icon: FiCpu, text: 'text-pink-400', bg: 'bg-pink-500/10', bar: 'from-pink-500 to-pink-400' },
    other: { label: 'Other', Icon: FiCpu, text: 'text-gray-400', bg: 'bg-gray-500/10', bar: 'from-gray-500 to-gray-400' },
};

export const getSkillCategory = (category) => SKILL_CATEGORIES[category] || SKILL_CATEGORIES.other;

/**
 * Map a 0–100 proficiency value to a human-readable level so visitors can
 * immediately tell how strong each skill is.
 */
export const getSkillLevel = (proficiency) => {
    const v = Math.max(0, Math.min(100, Number(proficiency) || 0));
    if (v >= 90) return { label: 'Expert', text: 'text-emerald-400' };
    if (v >= 75) return { label: 'Advanced', text: 'text-blue-400' };
    if (v >= 60) return { label: 'Proficient', text: 'text-cyan-400' };
    if (v >= 40) return { label: 'Intermediate', text: 'text-amber-400' };
    return { label: 'Beginner', text: 'text-gray-400' };
};
