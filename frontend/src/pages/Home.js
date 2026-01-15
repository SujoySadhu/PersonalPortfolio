import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiDownload, FiCode, FiMail, FiMapPin } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { projectsAPI, skillsAPI, settingsAPI } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import SkillCard from '../components/skills/SkillCard';
import Loading from '../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Home = () => {
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, skillsRes, settingsRes] = await Promise.all([
                projectsAPI.getAll({ featured: true }),
                skillsAPI.getAll(),
                settingsAPI.get()
            ]);
            setFeaturedProjects(projectsRes.data.data?.slice(0, 3) || []);
            setSkills(skillsRes.data.data?.slice(0, 8) || []);
            setSettings(settingsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProfileImageUrl = () => {
        if (!settings?.profileImage) return null;
        return settings.profileImage.startsWith('http') 
            ? settings.profileImage 
            : `${API_URL}${settings.profileImage}`;
    };

    // Parse professional titles from comma-separated string
    const getTitles = () => {
        if (!settings?.title) return [];
        return settings.title.split(',').map(t => t.trim()).filter(t => t);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-24 md:py-16 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
                    
                    {/* Floating Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Profile Image - Left Side */}
                        <div className="animate-fade-in flex-shrink-0">
                            <div className="relative group">
                                {/* Rotating Border */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 via-purple-500 to-cyan-500 rounded-full opacity-50 blur-sm group-hover:opacity-75 transition-opacity duration-500 animate-spin-slow"></div>
                                
                                {/* Main Image Container */}
                                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-dark-100 shadow-2xl">
                                    {getProfileImageUrl() ? (
                                        <img 
                                            src={getProfileImageUrl()} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-600 via-purple-600 to-cyan-600 flex items-center justify-center">
                                            <span className="text-7xl md:text-8xl text-white font-bold">
                                                {settings?.name?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Status Badge */}
                                {settings?.isAvailableForHire && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full shadow-lg shadow-green-500/25">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        <span className="text-sm font-semibold whitespace-nowrap">Open to Work</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content - Right Side */}
                        <div className="text-center lg:text-left flex-1 animate-fade-in">
                            {/* Greeting */}
                            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
                                <span className="text-2xl">👋</span>
                                <span className="text-primary-400 font-medium">Hello, I'm</span>
                            </div>
                            
                            {/* Name */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
                                {settings?.name || 'Your Name'}
                            </h1>
                            
                            {/* Professional Titles */}
                            {getTitles().length > 0 && (
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                                    {getTitles().map((title, index) => (
                                        <span 
                                            key={index}
                                            className="px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-full text-primary-300 text-sm font-medium"
                                        >
                                            {title}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Tagline */}
                            <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-400 mb-6 font-light">
                                {settings?.tagline || 'I build things for the web.'}
                            </h2>
                            
                            {/* Bio */}
                            <p className="text-gray-500 text-lg max-w-2xl mb-8 leading-relaxed">
                                {settings?.bio || "I'm a full-stack developer specializing in building exceptional digital experiences."}
                            </p>
                            
                            {/* Location & Email */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8 text-gray-400">
                                {settings?.location && (
                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="text-primary-400" />
                                        <span>{settings.location}</span>
                                    </div>
                                )}
                                {settings?.email && (
                                    <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                                        <FiMail className="text-primary-400" />
                                        <span>{settings.email}</span>
                                    </a>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                                <Link 
                                    to="/projects" 
                                    className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        View My Work 
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                
                                {settings?.resumeLink && (
                                    <a 
                                        href={settings.resumeLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <FiDownload /> Resume
                                    </a>
                                )}
                                
                                <Link 
                                    to="/contact" 
                                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300"
                                >
                                    Contact Me
                                </Link>
                            </div>

                            {/* Social Links */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                {settings?.socialLinks?.github && (
                                    <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-700 transition-all duration-300" title="GitHub">
                                        <FiGithub size={22} />
                                    </a>
                                )}
                                {settings?.socialLinks?.linkedin && (
                                    <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300" title="LinkedIn">
                                        <FiLinkedin size={22} />
                                    </a>
                                )}
                                {settings?.socialLinks?.twitter && (
                                    <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-sky-500 hover:border-sky-500 transition-all duration-300" title="Twitter">
                                        <FiTwitter size={22} />
                                    </a>
                                )}
                                {settings?.socialLinks?.leetcode && (
                                    <a href={settings.socialLinks.leetcode} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-all duration-300" title="LeetCode">
                                        <SiLeetcode size={20} />
                                    </a>
                                )}
                                {settings?.socialLinks?.codeforces && (
                                    <a href={settings.socialLinks.codeforces} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400 transition-all duration-300" title="Codeforces">
                                        <SiCodeforces size={20} />
                                    </a>
                                )}
                                {settings?.socialLinks?.codechef && (
                                    <a href={settings.socialLinks.codechef} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-600 transition-all duration-300" title="CodeChef">
                                        <SiCodechef size={20} />
                                    </a>
                                )}
                                {settings?.socialLinks?.hackerrank && (
                                    <a href={settings.socialLinks.hackerrank} target="_blank" rel="noopener noreferrer"
                                       className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-500 transition-all duration-300" title="HackerRank">
                                        <SiHackerrank size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-gradient-to-b from-primary-400 to-transparent rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Featured Projects Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-200 via-dark-300/50 to-dark-200"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-4">
                            Portfolio
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Featured <span className="gradient-text">Projects</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Here are some of my recent works that showcase my skills and expertise
                        </p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : featuredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProjects.map((project) => (
                                <ProjectCard key={project._id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCode className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500">No featured projects yet</p>
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link 
                            to="/projects" 
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors group"
                        >
                            View All Projects 
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
                            Expertise
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Skills & <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Technologies</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Technologies and tools I use to bring ideas to life
                        </p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : skills.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {skills.map((skill) => (
                                <SkillCard key={skill._id} skill={skill} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCode className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500">No skills added yet</p>
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link 
                            to="/skills" 
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors group"
                        >
                            View All Skills 
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-purple-900/30 to-primary-900/30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
                        <span className="text-xl">🤝</span>
                        <span className="text-gray-300 font-medium">Let's Collaborate</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Have a project in mind?
                    </h2>
                    <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/contact" 
                            className="group px-10 py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
                        >
                            <span className="flex items-center gap-2">
                                Get In Touch 
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        
                        {settings?.email && (
                            <a 
                                href={`mailto:${settings.email}`}
                                className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                            >
                                <FiMail /> {settings.email}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
