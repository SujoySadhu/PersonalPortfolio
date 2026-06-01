import React from 'react';
import { FiExternalLink, FiCalendar, FiAward } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';
import { getAchCategory, formatAchDate } from '../../config/achievementMeta';

const AchievementCard = ({ achievement, onClick }) => {
    const { title, description, category, date, issuer, position, credentialLink, image } = achievement;
    const imageUrl = image ? getImageUrl(image) : null;
    const cat = getAchCategory(category);
    const CatIcon = cat.Icon;
    const dateStr = formatAchDate(date);

    return (
        <div
            onClick={onClick}
            className={`group relative h-full rounded-2xl p-[1px] bg-gradient-to-br from-gray-700/40 via-gray-800/20 to-gray-700/40 hover:from-pink-500/40 hover:via-purple-500/30 hover:to-emerald-500/40 transition-all duration-500 ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="relative bg-dark-100 rounded-2xl overflow-hidden h-full flex flex-col">
                {imageUrl ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/10 to-transparent" />
                        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border backdrop-blur-sm ${cat.cls}`}>
                            <CatIcon size={11} /> {cat.label}
                        </span>
                        {position && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-400 text-dark-200 shadow-lg">
                                <FiAward size={11} /> {position}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2 px-5 pt-5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cat.cls}`}>
                            <CatIcon size={11} /> {cat.label}
                        </span>
                        {position && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                <FiAward size={11} /> {position}
                            </span>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
                        {title}
                    </h3>

                    {(issuer || dateStr) && (
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5 text-xs text-gray-500">
                            {issuer && <span className="text-gray-400 font-medium">{issuer}</span>}
                            {issuer && dateStr && <span className="text-gray-700">·</span>}
                            {dateStr && (
                                <span className="inline-flex items-center gap-1">
                                    <FiCalendar size={11} /> {dateStr}
                                </span>
                            )}
                        </div>
                    )}

                    {description && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mt-3">{description}</p>
                    )}

                    {credentialLink && (
                        <a
                            href={credentialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors mt-4 pt-3 border-t border-gray-800/40"
                            onClick={(e) => e.stopPropagation()}
                        >
                            View credential <FiExternalLink size={13} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementCard;
