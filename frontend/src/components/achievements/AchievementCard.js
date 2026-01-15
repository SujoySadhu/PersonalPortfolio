import React, { useState, useEffect } from 'react';
import { FiAward, FiCalendar, FiExternalLink, FiStar } from 'react-icons/fi';
import { categoriesAPI, getImageUrl } from '../../services/api';

// Default fallback colors and icons
const defaultCategoryColors = {
    competition: 'from-blue-500 to-cyan-500',
    certification: 'from-green-500 to-emerald-500',
    award: 'from-yellow-500 to-amber-500',
    publication: 'from-purple-500 to-violet-500',
    hackathon: 'from-red-500 to-orange-500',
    scholarship: 'from-pink-500 to-rose-500',
    other: 'from-gray-500 to-slate-500'
};

const defaultCategoryIcons = {
    competition: '🏆',
    certification: '📜',
    award: '🎖️',
    publication: '📚',
    hackathon: '💻',
    scholarship: '🎓',
    other: '⭐'
};

// Cache for categories
let categoryCache = null;

const AchievementCard = ({ achievement }) => {
    const [categoryColors, setCategoryColors] = useState(defaultCategoryColors);
    const [categoryIcons, setCategoryIcons] = useState(defaultCategoryIcons);

    useEffect(() => {
        const loadCategories = async () => {
            if (categoryCache) {
                setCategoryColors(categoryCache.colors);
                setCategoryIcons(categoryCache.icons);
                return;
            }
            try {
                const response = await categoriesAPI.getBySection('achievement');
                if (response.data.data && response.data.data.length > 0) {
                    const colors = { ...defaultCategoryColors };
                    const icons = { ...defaultCategoryIcons };
                    response.data.data.forEach(cat => {
                        const key = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
                        colors[key] = cat.color;
                        icons[key] = cat.icon;
                    });
                    categoryCache = { colors, icons };
                    setCategoryColors(colors);
                    setCategoryIcons(icons);
                }
            } catch (err) {
                // Use defaults
            }
        };
        loadCategories();
    }, []);

    const {
        title,
        description,
        category,
        date,
        issuer,
        credentialLink,
        image,
        position,
        featured
    } = achievement;

    const imageUrl = image ? getImageUrl(image) : null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <div className={`relative bg-dark-200 rounded-xl border border-gray-800 overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 group ${featured ? 'ring-2 ring-yellow-500/30' : ''}`}>
            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-3 right-3 z-10 bg-yellow-500/90 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FiStar size={12} /> Featured
                </div>
            )}

            {/* Category Badge */}
            <div className={`absolute top-3 left-3 z-10 bg-gradient-to-r ${categoryColors[category] || categoryColors.other} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                <span>{categoryIcons[category] || categoryIcons.other}</span>
                <span className="capitalize">{category}</span>
            </div>

            {/* Image or Gradient Background */}
            <div className="h-32 relative overflow-hidden">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${categoryColors[category] || categoryColors.other} opacity-20`}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-5 -mt-8 relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categoryColors[category] || categoryColors.other} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                    {categoryIcons[category] || categoryIcons.other}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {title}
                </h3>

                {/* Position/Rank */}
                {position && (
                    <p className="text-primary-400 font-semibold text-sm mb-2">
                        🏅 {position}
                    </p>
                )}

                {/* Issuer */}
                {issuer && (
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <FiAward size={14} className="text-gray-500" />
                        {issuer}
                    </p>
                )}

                {/* Date */}
                {date && (
                    <p className="text-gray-500 text-xs mb-3 flex items-center gap-2">
                        <FiCalendar size={12} />
                        {formatDate(date)}
                    </p>
                )}

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {description}
                </p>

                {/* Credential Link */}
                {credentialLink && (
                    <a
                        href={credentialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                        View Credential <FiExternalLink size={14} />
                    </a>
                )}
            </div>
        </div>
    );
};

export default AchievementCard;
