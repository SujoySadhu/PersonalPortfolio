import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-10 h-10',
        large: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`${sizeClasses[size]} border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin`}></div>
            {text && <p className="mt-4 text-gray-400">{text}</p>}
        </div>
    );
};

export default Loading;
