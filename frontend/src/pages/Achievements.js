import React, { useState, useEffect } from 'react';
import { achievementsAPI } from '../services/api';
import AchievementCard from '../components/achievements/AchievementCard';
import Spinner from '../components/common/Spinner';
import { FiAward } from 'react-icons/fi';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await achievementsAPI.getAll();
            const data = response.data.data || [];
            // Featured first, then by the admin-defined order
            data.sort((a, b) => (b.featured === true) - (a.featured === true) || (a.order || 0) - (b.order || 0));
            setAchievements(data);
        } catch (err) {
            setError('Failed to load achievements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <div className="section-ornament" />
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Achievements</h1>
                            <p className="text-gray-400 text-base">
                                Awards, certifications, and milestones I'm proud of.
                            </p>
                        </div>
                        {achievements.length > 0 && (
                            <span className="text-sm text-gray-500 pb-1">
                                {achievements.length} {achievements.length === 1 ? 'achievement' : 'achievements'}
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {achievements.map(achievement => (
                            <AchievementCard key={achievement._id} achievement={achievement} />
                        ))}
                    </div>
                ) : (
                    !error && (
                        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
                            <FiAward className="text-gray-700 mx-auto mb-4" size={40} />
                            <h3 className="text-lg font-semibold text-white mb-1">No achievements yet</h3>
                            <p className="text-gray-500 text-sm">Check back soon.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Achievements;
