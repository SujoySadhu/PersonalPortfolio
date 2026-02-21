import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-[3px]',
        large: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`${sizeClasses[size]} border-gray-700/50 border-t-primary-400 rounded-full animate-spin`}></div>
            {text && <p className="mt-3 text-gray-500 text-sm">{text}</p>}
        </div>
    );
};

export default Loading;
