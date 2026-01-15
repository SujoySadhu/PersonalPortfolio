import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiGithub, FiLinkedin, FiMail, FiChevronDown } from 'react-icons/fi';
import { settingsAPI } from '../../services/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const moreRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        settingsAPI.get()
            .then(res => setSettings(res.data.data))
            .catch(err => console.error('Error loading settings:', err));
    }, []);

    // Main nav links
    const mainLinks = [
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Skills', path: '/skills' },
        { name: 'Contact', path: '/contact' }
    ];

    // More dropdown links
    const moreLinks = [
        { name: 'Research', path: '/research' },
        { name: 'Achievements', path: '/achievements' },
        { name: 'Blog', path: '/blog' },
        { name: 'Interests', path: '/interests' },
        { name: 'Currently Working', path: '/current-work' }
    ];

    // All links for mobile
    const allLinks = [...mainLinks.slice(0, 3), ...moreLinks, mainLinks[3]];

    const isActive = (path) => location.pathname === path;
    const isMoreActive = moreLinks.some(link => location.pathname === link.path);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreRef.current && !moreRef.current.contains(event.target)) {
                setMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setMoreOpen(false);
    }, [location.pathname]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold gradient-text">{settings?.name?.split(' ')[0] || 'Portfolio'}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {mainLinks.slice(0, 3).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.path)
                                        ? 'text-primary-400'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* More Dropdown */}
                        <div className="relative" ref={moreRef}>
                            <button
                                onClick={() => setMoreOpen(!moreOpen)}
                                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                                    isMoreActive
                                        ? 'text-primary-400'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                More
                                <FiChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {moreOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-dark-100 border border-gray-700 rounded-lg shadow-xl py-2 animate-fade-in">
                                    {moreLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`block px-4 py-2 text-sm transition-colors ${
                                                isActive(link.path)
                                                    ? 'text-primary-400 bg-primary-600/10'
                                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            to="/contact"
                            className={`text-sm font-medium transition-colors duration-200 ${
                                isActive('/contact')
                                    ? 'text-primary-400'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Social Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {settings?.socialLinks?.github && (
                            <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FiGithub size={20} />
                            </a>
                        )}
                        {settings?.socialLinks?.linkedin && (
                            <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FiLinkedin size={20} />
                            </a>
                        )}
                        {settings?.email && (
                            <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition-colors">
                                <FiMail size={20} />
                            </a>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden bg-dark-100 border-b border-gray-800 animate-slide-down">
                    <div className="px-4 py-4 space-y-3">
                        {allLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'bg-primary-600/20 text-primary-400'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 px-3 pt-4 border-t border-gray-700">
                            {settings?.socialLinks?.github && (
                                <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                    <FiGithub size={20} />
                                </a>
                            )}
                            {settings?.socialLinks?.linkedin && (
                                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                    <FiLinkedin size={20} />
                                </a>
                            )}
                            {settings?.email && (
                                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white">
                                    <FiMail size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
