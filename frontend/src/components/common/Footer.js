import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiHeart, FiExternalLink } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { settingsAPI } from '../../services/api';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        settingsAPI.get()
            .then(res => setSettings(res.data.data))
            .catch(err => console.error('Error loading settings:', err));
    }, []);

    const socialIcons = {
        github: FiGithub,
        linkedin: FiLinkedin,
        twitter: FiTwitter,
        email: FiMail,
        leetcode: SiLeetcode,
        codeforces: SiCodeforces,
        codechef: SiCodechef,
        hackerrank: SiHackerrank
    };

    const getSocialLinks = () => {
        const links = [];
        if (settings?.socialLinks?.github) links.push({ name: 'github', url: settings.socialLinks.github });
        if (settings?.socialLinks?.linkedin) links.push({ name: 'linkedin', url: settings.socialLinks.linkedin });
        if (settings?.socialLinks?.twitter) links.push({ name: 'twitter', url: settings.socialLinks.twitter });
        if (settings?.email) links.push({ name: 'email', url: `mailto:${settings.email}` });
        return links;
    };

    return (
        <footer className="bg-dark-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="text-xl font-bold gradient-text mb-4 inline-block">
                            {settings?.name || 'Portfolio'}
                        </Link>
                        <p className="text-gray-400 text-sm mt-2">
                            {settings?.tagline || 'Building amazing digital experiences with modern technologies.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/projects" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Projects</Link></li>
                            <li><Link to="/skills" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Skills</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Connect</h4>
                        <div className="flex flex-wrap gap-3">
                            {getSocialLinks().map((social) => {
                                const Icon = socialIcons[social.name] || FiExternalLink;
                                return (
                                    <a 
                                        key={social.name}
                                        href={social.url} 
                                        target={social.name !== 'email' ? '_blank' : undefined}
                                        rel={social.name !== 'email' ? 'noopener noreferrer' : undefined}
                                        className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                                        title={social.name.charAt(0).toUpperCase() + social.name.slice(1)}
                                    >
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                        © {currentYear} {settings?.name || 'Portfolio'}. Made with <FiHeart className="text-red-500" /> All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
