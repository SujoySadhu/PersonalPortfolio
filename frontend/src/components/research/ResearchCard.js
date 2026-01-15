import React from 'react';
import { FiExternalLink, FiFileText } from 'react-icons/fi';

const ResearchCard = ({ research }) => {
    const {
        title,
        abstract,
        authors,
        journalName,
        conferenceName,
        publicationDate,
        pdfLink,
        doiLink,
        keywords,
        type,
        featured
    } = research;

    const typeColors = {
        journal: 'bg-blue-500/20 text-blue-400',
        conference: 'bg-green-500/20 text-green-400',
        thesis: 'bg-purple-500/20 text-purple-400',
        preprint: 'bg-yellow-500/20 text-yellow-400',
        other: 'bg-gray-500/20 text-gray-400'
    };

    return (
        <div className={`card p-6 ${featured ? 'border-primary-500/50' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[type]}`}>
                            {type?.charAt(0).toUpperCase() + type?.slice(1)}
                        </span>
                        {featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                Featured
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-white hover:text-primary-400 transition-colors">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Authors */}
            {authors && authors.length > 0 && (
                <p className="text-sm text-gray-400 mb-3">
                    {authors.join(', ')}
                </p>
            )}

            {/* Publication Info */}
            <div className="text-sm text-gray-500 mb-4">
                {journalName && <span>{journalName}</span>}
                {conferenceName && <span>{conferenceName}</span>}
                {publicationDate && (
                    <span className="ml-2">
                        • {new Date(publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                )}
            </div>

            {/* Abstract */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {abstract}
            </p>

            {/* Keywords */}
            {keywords && keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {keywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
            )}

            {/* Links */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
                {pdfLink && (
                    <a
                        href={pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        <FiFileText size={16} />
                        View PDF
                    </a>
                )}
                {doiLink && (
                    <a
                        href={doiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        <FiExternalLink size={16} />
                        DOI Link
                    </a>
                )}
            </div>
        </div>
    );
};

export default ResearchCard;
