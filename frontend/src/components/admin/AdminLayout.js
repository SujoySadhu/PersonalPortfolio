import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FiHome, FiFolder, FiCode, FiFileText, 
    FiLogOut, FiMenu, FiX, FiChevronLeft, FiSettings, FiAward, FiGrid, FiEdit3,
    FiHeart, FiActivity
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
        { name: 'Projects', path: '/admin/projects', icon: FiFolder },
        { name: 'Skills', path: '/admin/skills', icon: FiCode },
        { name: 'Research', path: '/admin/research', icon: FiFileText },
        { name: 'Achievements', path: '/admin/achievements', icon: FiAward },
        { name: 'Blog', path: '/admin/blogs', icon: FiEdit3 },
        { name: 'Interests', path: '/admin/interests', icon: FiHeart },
        { name: 'Current Work', path: '/admin/current-work', icon: FiActivity },
        { name: 'Categories', path: '/admin/categories', icon: FiGrid },
        { name: 'Settings', path: '/admin/settings', icon: FiSettings }
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-dark-200">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-100 border-b border-gray-800 px-4 h-16 flex items-center justify-between">
                <Link to="/admin/dashboard" className="text-xl font-bold gradient-text">
                    Admin Panel
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-dark-100 border-r border-gray-800 transform transition-transform duration-200 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                    <Link to="/admin/dashboard" className="text-xl font-bold gradient-text">
                        Admin Panel
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive(item.path)
                                    ? 'bg-primary-600/20 text-primary-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-dark-100">
                    {/* View Site Link */}
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2 text-sm"
                    >
                        <FiChevronLeft size={18} />
                        View Site
                    </Link>

                    {/* User Info */}
                    <div className="flex items-center justify-between px-4 py-3 bg-dark-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium truncate max-w-[100px]">
                                    {user?.name || 'Admin'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <FiLogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-20 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : ''} lg:ml-64`}>
                <div className="pt-16 lg:pt-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
