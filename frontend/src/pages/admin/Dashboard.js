import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiFolder, FiCode, FiFileText, FiAward,
    FiPlus, FiEye
} from 'react-icons/fi';
import { projectsAPI, skillsAPI, researchAPI, achievementsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        projects: 0,
        skills: 0,
        research: 0,
        achievements: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [projectsRes, skillsRes, researchRes, achievementsRes] = await Promise.all([
                projectsAPI.getAll(),
                skillsAPI.getAll(),
                researchAPI.getAll(),
                achievementsAPI.getAll()
            ]);

            setStats({
                projects: projectsRes.data.count || 0,
                skills: skillsRes.data.count || 0,
                research: researchRes.data.count || 0,
                achievements: achievementsRes.data.count || achievementsRes.data.data?.length || 0
            });

            setRecentProjects(projectsRes.data.data?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Projects',
            value: stats.projects,
            icon: FiFolder,
            color: 'from-blue-500 to-cyan-500',
            link: '/admin/projects'
        },
        {
            title: 'Skills',
            value: stats.skills,
            icon: FiCode,
            color: 'from-green-500 to-emerald-500',
            link: '/admin/skills'
        },
        {
            title: 'Publications',
            value: stats.research,
            icon: FiFileText,
            color: 'from-purple-500 to-pink-500',
            link: '/admin/research'
        },
        {
            title: 'Achievements',
            value: stats.achievements,
            icon: FiAward,
            color: 'from-yellow-500 to-orange-500',
            link: '/admin/achievements'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loading text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="gradient-text">{user?.name || 'Admin'}</span>
                    </h1>
                    <p className="text-gray-400">Manage your portfolio content from here.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <Link
                            key={index}
                            to={stat.link}
                            className="card p-6 hover:border-primary-500/50 transition-all duration-300 group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="text-white" size={24} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Quick Add */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                to="/admin/projects/new"
                                className="flex items-center gap-3 p-4 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <FiPlus className="text-blue-400" />
                                </div>
                                <span className="text-gray-300">New Project</span>
                            </Link>
                            <Link
                                to="/admin/skills/new"
                                className="flex items-center gap-3 p-4 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <FiPlus className="text-green-400" />
                                </div>
                                <span className="text-gray-300">New Skill</span>
                            </Link>
                            <Link
                                to="/admin/research/new"
                                className="flex items-center gap-3 p-4 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <FiPlus className="text-purple-400" />
                                </div>
                                <span className="text-gray-300">New Publication</span>
                            </Link>
                            <Link
                                to="/admin/achievements/new"
                                className="flex items-center gap-3 p-4 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <FiPlus className="text-yellow-400" />
                                </div>
                                <span className="text-gray-300">New Achievement</span>
                            </Link>
                            <Link
                                to="/"
                                target="_blank"
                                className="flex items-center gap-3 p-4 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors col-span-2"
                            >
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <FiEye className="text-cyan-400" />
                                </div>
                                <span className="text-gray-300">View Public Site</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                            <Link to="/admin/projects" className="text-primary-400 text-sm hover:text-primary-300">
                                View All →
                            </Link>
                        </div>
                        {recentProjects.length > 0 ? (
                            <div className="space-y-3">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project._id}
                                        to={`/admin/projects/edit/${project._id}`}
                                        className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gray-700 rounded-lg overflow-hidden">
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail.startsWith('http') ? project.thumbnail : `http://localhost:5000${project.thumbnail}`}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiFolder className="text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{project.title}</p>
                                            <p className="text-gray-500 text-sm capitalize">{project.category}</p>
                                        </div>
                                        {project.featured && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                Featured
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">No projects yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
