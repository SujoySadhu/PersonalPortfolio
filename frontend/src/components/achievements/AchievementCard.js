import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

const AchievementCard = ({ achievement }) => {
    const { title, description, credentialLink, image } = achievement;
    const imageUrl = image ? getImageUrl(image) : null;

    return (
        <div className="group">
            {/* Card with gradient border */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-emerald-500/40 hover:from-pink-500/60 hover:via-purple-500/50 hover:to-emerald-500/60 transition-all duration-500">
                <div className="bg-dark-100 rounded-2xl overflow-hidden">
                    {/* Image */}
                    {imageUrl && (
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-primary-400 transition-colors">
                            {title}
                        </h3>

                        {description && (
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{description}</p>
                        )}

                        {credentialLink && (
                            <a
                                href={credentialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-400 font-medium transition-colors mt-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View credential <FiExternalLink size={13} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementCard;
