import React, { useEffect, useState } from 'react';
import { getSkillCategory, getSkillLevel } from '../../config/skillCategories';

const SkillCard = ({ skill }) => {
    const { name, category, proficiency = 0, icon: skillIcon } = skill;
    const cfg = getSkillCategory(category);
    const level = getSkillLevel(proficiency);
    const Icon = cfg.Icon;
    const pct = Math.max(0, Math.min(100, Math.round(Number(proficiency) || 0)));

    // Animate the bar filling on mount for a polished feel
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 80);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div className="group py-3">
            {/* Name + percentage */}
            <div className="flex items-center gap-3 mb-2">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
                    {skillIcon ? <span className="text-sm">{skillIcon}</span> : <Icon size={16} />}
                </div>
                <span className="flex-1 min-w-0 text-sm text-white font-medium truncate">{name}</span>
                <span className="shrink-0 text-xs font-semibold text-gray-300 tabular-nums">{pct}%</span>
            </div>
            {/* Bar + level label */}
            <div className="flex items-center gap-2.5 ml-12">
                <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-[width] duration-1000 ease-out`}
                        style={{ width: `${width}%` }}
                    />
                </div>
                <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${level.text}`}>
                    {level.label}
                </span>
            </div>
        </div>
    );
};

export default React.memo(SkillCard);
