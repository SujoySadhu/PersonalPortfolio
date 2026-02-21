import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiExternalLink, FiArrowUp } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { settings } = useSettings();
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const socialIcons = {
        github: { icon: FiGithub, color: 'text-gray-400 hover:text-white' },
        linkedin: { icon: FiLinkedin, color: 'text-[#0A66C2] hover:text-[#0A66C2]/80' },
        twitter: { icon: FiTwitter, color: 'text-gray-400 hover:text-white' },
        email: { icon: FiMail, color: 'text-gray-400 hover:text-white' },
        leetcode: { icon: SiLeetcode, color: 'text-[#FFA116] hover:text-[#FFA116]/80' },
        codeforces: { icon: SiCodeforces, color: 'text-[#1F8ACB] hover:text-[#1F8ACB]/80' },
        codechef: { icon: SiCodechef, color: 'text-[#D4A96A] hover:text-[#D4A96A]/80' },
        hackerrank: { icon: SiHackerrank, color: 'text-[#2EC866] hover:text-[#2EC866]/80' },
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
        <>
            <footer className="relative border-t border-gray-800/60">
                {/* Gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                        {/* Brand */}
                        <div className="max-w-xs">
                            <Link to="/" className="text-lg font-semibold text-white tracking-tight inline-block mb-2">
                                {settings?.name || 'Portfolio'}
                            </Link>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {settings?.tagline || 'Building digital experiences with modern technologies.'}
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex gap-12">
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Navigate</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/projects" className="text-gray-600 hover:text-white text-sm transition-colors">Projects</Link></li>
                                    <li><Link to="/skills" className="text-gray-600 hover:text-white text-sm transition-colors">Skills</Link></li>
                                    <li><Link to="/blog" className="text-gray-600 hover:text-white text-sm transition-colors">Blog</Link></li>
                                    <li><Link to="/contact" className="text-gray-600 hover:text-white text-sm transition-colors">Contact</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Connect</h4>
                                <div className="flex gap-2">
                                    {getSocialLinks().map((social) => {
                                        const entry = socialIcons[social.name];
                                        const Icon = entry?.icon || FiExternalLink;
                                        const colorCls = entry?.color || 'text-gray-400 hover:text-white';
                                        return (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target={social.name !== 'email' ? '_blank' : undefined}
                                                rel={social.name !== 'email' ? 'noopener noreferrer' : undefined}
                                                className={`w-8 h-8 rounded-md flex items-center justify-center ${colorCls} transition-all duration-200 social-glow`}
                                                title={social.name.charAt(0).toUpperCase() + social.name.slice(1)}
                                            >
                                                <Icon size={16} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-10 pt-6 border-t border-gray-800/40">
                        <p className="text-gray-700 text-xs">
                            &copy; {currentYear} {settings?.name || 'Portfolio'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Back to top button */}
            <button
                onClick={scrollToTop}
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                aria-label="Back to top"
            >
                <FiArrowUp size={18} />
            </button>
        </>
    );
};

export default React.memo(Footer);
