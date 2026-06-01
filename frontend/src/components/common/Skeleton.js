import React from 'react';

/**
 * Skeleton loading components for perceived performance.
 * Shows content placeholders instead of spinners so users
 * see the page structure immediately.
 */

// Base shimmer animation
const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent";

export const SkeletonBox = ({ className = '' }) => (
    <div className={`bg-gray-800/50 rounded-lg ${shimmer} ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
    <div className={`space-y-2.5 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={`h-3 bg-gray-800/50 rounded ${shimmer}`}
                style={{ width: i === lines - 1 ? '60%' : '100%' }}
            />
        ))}
    </div>
);

export const SkeletonCircle = ({ size = 'w-20 h-20', className = '' }) => (
    <div className={`${size} rounded-full bg-gray-800/50 ${shimmer} ${className}`} />
);

// Hero section skeleton
export const HeroSkeleton = () => (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-shrink-0">
                    <SkeletonCircle size="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80" />
                </div>
                <div className="flex-1 w-full max-w-xl">
                    <SkeletonBox className="h-12 w-3/4 mb-4 mx-auto lg:mx-0" />
                    <SkeletonBox className="h-6 w-1/2 mb-5 mx-auto lg:mx-0" />
                    <SkeletonText lines={3} className="mb-6" />
                    <div className="flex gap-3 justify-center lg:justify-start">
                        <SkeletonBox className="h-12 w-32" />
                        <SkeletonBox className="h-12 w-28" />
                        <SkeletonBox className="h-12 w-24" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// Project card skeleton — mirrors the ProjectCard layout
export const ProjectCardSkeleton = () => (
    <div className="bg-dark-100 rounded-2xl border border-gray-800/60 p-6 h-full flex flex-col">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between mb-3">
            <SkeletonBox className="h-3.5 w-20 rounded" />
            <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>
        {/* Title */}
        <SkeletonBox className="h-5 w-4/5 mb-2" />
        <SkeletonBox className="h-5 w-1/2 mb-4" />
        {/* Description */}
        <SkeletonText lines={3} className="mb-5" />
        {/* Tech rows */}
        <div className="space-y-2.5 mb-5">
            {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-2">
                    <SkeletonBox className="h-3 w-14 rounded" />
                    <SkeletonBox className="h-5 w-16 rounded" />
                    <SkeletonBox className="h-5 w-14 rounded" />
                </div>
            ))}
        </div>
        {/* Footer */}
        <div className="flex gap-2.5 mt-auto pt-4 border-t border-gray-800/40">
            <SkeletonBox className="h-9 w-28 rounded-full" />
            <SkeletonBox className="h-9 w-20 rounded-full" />
        </div>
    </div>
);

// Skill card skeleton
export const SkillCardSkeleton = () => (
    <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
            <SkeletonBox className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
                <SkeletonBox className="h-4 w-24 mb-1" />
                <SkeletonBox className="h-3 w-16" />
            </div>
        </div>
        <SkeletonBox className="h-2 w-full rounded-full mt-2" />
    </div>
);

// Section heading skeleton
export const SectionSkeleton = ({ cards = 3, CardSkeleton = ProjectCardSkeleton, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) => (
    <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <SkeletonBox className="h-8 w-24 mx-auto mb-4 rounded-full" />
                <SkeletonBox className="h-10 w-64 mx-auto mb-4" />
                <SkeletonBox className="h-5 w-96 mx-auto" />
            </div>
            <div className={`grid ${cols} gap-5`}>
                {Array.from({ length: cards }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    </section>
);

// Generic list skeleton
export const ListSkeleton = ({ items = 4 }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="bg-dark-200 border border-gray-800 rounded-xl p-6">
                <SkeletonBox className="h-5 w-3/4 mb-2" />
                <SkeletonText lines={2} />
            </div>
        ))}
    </div>
);

export default SkeletonBox;
