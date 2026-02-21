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
            setAchievements(response.data.data);
        } catch (err) {
            setError('Failed to load achievements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-100 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-100 pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Achievements
                    </h1>
                    <p className="text-gray-400 text-base">
                        Here are some of my notable achievements and recognitions throughout my career.
                    </p>
                </div>

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {achievements.map(achievement => (
                            <AchievementCard key={achievement._id} achievement={achievement} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FiAward className="text-gray-700 mx-auto mb-3" size={32} />
                        <h3 className="text-lg font-semibold text-white mb-1">No Achievements Yet</h3>
                        <p className="text-gray-500 text-sm">No achievements have been added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
