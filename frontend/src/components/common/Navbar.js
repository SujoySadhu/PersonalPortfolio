import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';

const navItems = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/skills', label: 'Skills' },
    { path: '/research', label: 'Research' },
    { path: '/achievements', label: 'Achievements' },
    { path: '/blog', label: 'Blog' },
    { path: '/interests', label: 'Interests' },
    { path: '/current-work', label: 'Building' },
    { path: '/contact', label: 'Contact' },
];

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { settings } = useSettings();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-300/90 backdrop-blur-xl shadow-lg shadow-black/10' : 'bg-transparent'
            }`}>
            {scrolled && <div className="nav-gradient-line" />}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                            {(settings?.name?.charAt(0) || 'P').toUpperCase()}
                        </span>
                        <span className="text-white font-semibold text-lg tracking-tight group-hover:text-primary-400 transition-colors">
                            {settings?.name?.split(' ')[0] || 'Portfolio'}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {navItems.map(({ path, label }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive(path)
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {label}
                                <span className={`absolute left-3 right-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-200 origin-center ${isActive(path) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                                    }`} />
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-dark-300/95 backdrop-blur-xl border-b border-gray-800/40 animate-slide-down">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map(({ path, label }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(path)
                                    ? 'text-white bg-gray-800/60'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
